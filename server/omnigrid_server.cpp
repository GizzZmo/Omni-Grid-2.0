#include <arpa/inet.h>
#include <netinet/in.h>
#include <sys/socket.h>
#include <unistd.h>

#include <atomic>
#include <array>
#include <algorithm>
#include <cerrno>
#include <condition_variable>
#include <cstdio>
#include <csignal>
#include <cstring>
#include <filesystem>
#include <fstream>
#include <iostream>
#include <mutex>
#include <optional>
#include <queue>
#include <sstream>
#include <string>
#include <unordered_map>
#include <vector>
#include <thread>
#include <system_error>
#include <sys/time.h>

namespace fs = std::filesystem;
namespace {
std::atomic<bool> running{true};
int server_fd_global = -1;
constexpr const char* kIndexFile = "index.html";
constexpr int kDefaultPort = 1234;
}  // namespace

void handle_signal(int) {
    running = false;
    if (server_fd_global != -1) {
        shutdown(server_fd_global, SHUT_RDWR);
    }
}

std::string sanitize_path(const std::string &raw_path) {
    std::string path = raw_path;
    const auto query_pos = path.find('?');
    if (query_pos != std::string::npos) {
        path = path.substr(0, query_pos);
    }
    if (path.empty() || path.front() != '/') {
        path = "/" + path;
    }

    std::vector<std::string> parts;
    std::stringstream ss(path);
    std::string segment;
    while (std::getline(ss, segment, '/')) {
        if (segment.empty() || segment == ".") continue;
        if (segment == "..") continue;
        parts.push_back(segment);
    }

    std::string cleaned = "/";
    for (size_t i = 0; i < parts.size(); ++i) {
        cleaned += parts[i];
        if (i + 1 < parts.size()) cleaned += "/";
    }
    return cleaned;
}

bool has_extension(const std::string &path) {
    const auto slash_pos = path.find_last_of('/');
    const auto dot_pos = path.find_last_of('.');
    return dot_pos != std::string::npos && (slash_pos == std::string::npos || dot_pos > slash_pos);
}

std::string mime_type(const fs::path &path) {
    static const std::unordered_map<std::string, std::string> mime_map = {
        {".html", "text/html"},
        {".htm", "text/html"},
        {".css", "text/css"},
        {".js", "application/javascript"},
        {".json", "application/json"},
        {".png", "image/png"},
        {".jpg", "image/jpeg"},
        {".jpeg", "image/jpeg"},
        {".svg", "image/svg+xml"},
        {".ico", "image/x-icon"},
        {".txt", "text/plain"},
        {".wasm", "application/wasm"},
        {".map", "application/json"}};

    const auto ext = path.extension().string();
    const auto it = mime_map.find(ext);
    if (it != mime_map.end()) {
        return it->second;
    }
    return "application/octet-stream";
}

bool send_all(int client_fd, const std::string &payload) {
    size_t sent = 0;
    const auto total = payload.size();
    while (sent < total) {
        const auto chunk =
            send(client_fd, payload.data() + sent, total - sent, 0);
        if (chunk <= 0) return false;
        sent += static_cast<size_t>(chunk);
    }
    return true;
}

bool send_response(int client_fd, int status, const std::string &status_text,
                   const std::string &content_type, const std::string &body) {
    std::ostringstream oss;
    oss << "HTTP/1.1 " << status << " " << status_text << "\r\n";
    oss << "Content-Length: " << body.size() << "\r\n";
    oss << "Content-Type: " << content_type << "\r\n";
    oss << "Connection: close\r\n\r\n";
    const auto header = oss.str();
    if (!send_all(client_fd, header)) return false;
    if (!body.empty()) return send_all(client_fd, body);
    return true;
}

std::optional<std::string> load_file(const fs::path &path) {
    std::ifstream file(path, std::ios::binary);
    if (!file) return std::nullopt;
    std::ostringstream buffer;
    buffer << file.rdbuf();
    return buffer.str();
}

std::string read_request(int client_fd) {
    constexpr size_t kMaxRequestSize = 8192;
    std::array<char, kMaxRequestSize> buffer{};
    std::string data;
    ssize_t received = 0;
    while (data.find("\r\n\r\n") == std::string::npos &&
           (received = recv(client_fd, buffer.data(), buffer.size(), 0)) > 0) {
        data.append(buffer.data(), static_cast<size_t>(received));
        if (data.size() >= kMaxRequestSize) break;
    }
    return data;
}

bool path_within_root(const fs::path &root, const fs::path &target) {
    std::error_code ec;
    const auto normalized_root = fs::weakly_canonical(root, ec);
    if (ec) return false;
    const auto normalized_target = fs::weakly_canonical(target, ec);
    if (ec) return false;
    auto root_it = normalized_root.begin();
    auto target_it = normalized_target.begin();
    for (; root_it != normalized_root.end() && target_it != normalized_target.end();
         ++root_it, ++target_it) {
        if (*root_it != *target_it) return false;
    }
    return root_it == normalized_root.end();
}

void handle_client(int client_fd, const fs::path &root_dir) {
    timeval timeout{};
    timeout.tv_sec = 5;
    timeout.tv_usec = 0;
    setsockopt(client_fd, SOL_SOCKET, SO_RCVTIMEO, &timeout, sizeof(timeout));

    const auto raw_request = read_request(client_fd);
    const auto line_end = raw_request.find("\r\n");
    const auto request_line =
        line_end == std::string::npos ? raw_request : raw_request.substr(0, line_end);

    if (request_line.rfind("GET ", 0) != 0) {
        send_response(client_fd, 405, "Method Not Allowed", "text/plain",
                      "Only GET is supported.\n");
        return;
    }

    const auto first_space = request_line.find(' ');
    const auto second_space = request_line.find(' ', first_space + 1);
    if (first_space == std::string::npos || second_space == std::string::npos) {
        send_response(client_fd, 400, "Bad Request", "text/plain", "Malformed request.\n");
        return;
    }

    const auto raw_path = request_line.substr(first_space + 1, second_space - first_space - 1);
    const auto path = sanitize_path(raw_path);

    fs::path target = path == "/" ? fs::path(kIndexFile) : fs::path(path.substr(1));
    target = (root_dir / target).lexically_normal();

    if (!fs::exists(target) && !has_extension(path)) {
        target = root_dir / kIndexFile;
    }

    std::error_code ec;
    const auto normalized_target = fs::weakly_canonical(target, ec);
    if (ec) {
        send_response(client_fd, 400, "Bad Request", "text/plain", "Invalid path.\n");
        return;
    }
    if (!path_within_root(root_dir, normalized_target)) {
        send_response(client_fd, 403, "Forbidden", "text/plain", "Invalid path.\n");
        return;
    }

    if (!fs::exists(normalized_target) || !fs::is_regular_file(normalized_target)) {
        send_response(client_fd, 404, "Not Found", "text/plain", "Resource not found.\n");
        return;
    }

    const auto body = load_file(normalized_target);
    if (!body) {
        send_response(client_fd, 500, "Internal Server Error", "text/plain",
                      "Failed to read file.\n");
        return;
    }

    send_response(client_fd, 200, "OK", mime_type(target), *body);
}

int main(int argc, char *argv[]) {
    int port = kDefaultPort;
    if (const char *env_port = std::getenv("PORT")) {
        try {
            port = std::stoi(env_port);
        } catch (...) {
            std::cerr << "Invalid PORT value '" << env_port << "', using default " << kDefaultPort
                      << "\n";
            port = kDefaultPort;
        }
    }
    if (argc > 1) {
        try {
            port = std::stoi(argv[1]);
        } catch (...) {
            std::cerr << "Invalid port argument, using default " << kDefaultPort << "\n";
            port = kDefaultPort;
        }
    }

    if (port <= 0 || port > 65535) {
        std::cerr << "Port out of range, using default " << kDefaultPort << "\n";
        port = kDefaultPort;
    }

    fs::path root = fs::exists("dist") ? fs::path("dist") : fs::path(".");
    std::error_code root_ec;
    root = fs::weakly_canonical(root, root_ec);
    if (root_ec) {
        root_ec.clear();
        root = fs::absolute(root, root_ec);
    }
    std::mutex queue_mutex;
    std::condition_variable queue_cv;
    std::queue<int> client_queue;
    const auto concurrency = std::thread::hardware_concurrency();
    const size_t worker_count = std::max<size_t>(4, concurrency ? concurrency : 4);
    std::vector<std::thread> workers;
    workers.reserve(worker_count);

    int server_fd = socket(AF_INET, SOCK_STREAM, 0);
    server_fd_global = server_fd;
    std::signal(SIGINT, handle_signal);
    std::signal(SIGTERM, handle_signal);

    if (server_fd < 0) {
        std::cerr << "Failed to create socket\n";
        return 1;
    }

    int opt = 1;
    if (setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt)) < 0) {
        std::cerr << "Warning: failed to set SO_REUSEADDR\n";
    }

    sockaddr_in addr{};
    addr.sin_family = AF_INET;
    addr.sin_addr.s_addr = INADDR_ANY;
    addr.sin_port = htons(static_cast<uint16_t>(port));

    if (bind(server_fd, reinterpret_cast<sockaddr *>(&addr), sizeof(addr)) < 0) {
        std::cerr << "Failed to bind to port " << port << "\n";
        close(server_fd);
        return 1;
    }

    if (listen(server_fd, 16) < 0) {
        std::cerr << "Failed to listen on port " << port << "\n";
        close(server_fd);
        return 1;
    }

    std::cout << "Omni-Grid server listening on http://localhost:" << port
              << " serving " << root << "\n";

    for (size_t i = 0; i < worker_count; ++i) {
        workers.emplace_back([&queue_mutex, &queue_cv, &client_queue, root]() {
            while (true) {
                int client_fd = -1;
                {
                    std::unique_lock<std::mutex> lock(queue_mutex);
                    queue_cv.wait(lock, [&client_queue]() {
                        return !client_queue.empty() || !running.load();
                    });
                    if (!running.load() && client_queue.empty()) break;
                    client_fd = client_queue.front();
                    client_queue.pop();
                }
                handle_client(client_fd, root);
                close(client_fd);
            }
        });
    }

    while (running.load()) {
        sockaddr_in client_addr{};
        socklen_t client_len = sizeof(client_addr);
        int client_fd = accept(server_fd, reinterpret_cast<sockaddr *>(&client_addr), &client_len);
        if (client_fd < 0) {
            if (!running.load()) break;
            std::cerr << "accept failed: " << std::strerror(errno) << "\n";
            continue;
        }
        {
            std::lock_guard<std::mutex> lock(queue_mutex);
            client_queue.push(client_fd);
        }
        queue_cv.notify_one();
    }

    running = false;
    queue_cv.notify_all();
    close(server_fd);
    for (auto &worker : workers) {
        if (worker.joinable()) worker.join();
    }
    return 0;
}
