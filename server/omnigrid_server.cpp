#include <arpa/inet.h>
#include <netinet/in.h>
#include <sys/socket.h>
#include <unistd.h>

#include <filesystem>
#include <fstream>
#include <iostream>
#include <optional>
#include <sstream>
#include <string>
#include <unordered_map>
#include <vector>

namespace fs = std::filesystem;

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

void send_response(int client_fd, int status, const std::string &status_text,
                   const std::string &content_type, const std::string &body) {
    std::ostringstream oss;
    oss << "HTTP/1.1 " << status << " " << status_text << "\r\n";
    oss << "Content-Length: " << body.size() << "\r\n";
    oss << "Content-Type: " << content_type << "\r\n";
    oss << "Connection: close\r\n\r\n";
    const auto header = oss.str();
    send(client_fd, header.data(), header.size(), 0);
    if (!body.empty()) {
        send(client_fd, body.data(), body.size(), 0);
    }
}

std::optional<std::string> load_file(const fs::path &path) {
    std::ifstream file(path, std::ios::binary);
    if (!file) return std::nullopt;
    std::ostringstream buffer;
    buffer << file.rdbuf();
    return buffer.str();
}

std::string read_request(int client_fd) {
    char buffer[2048];
    std::string data;
    ssize_t received = 0;
    while (data.find("\r\n\r\n") == std::string::npos &&
           (received = recv(client_fd, buffer, sizeof(buffer), 0)) > 0) {
        data.append(buffer, received);
        if (data.size() > 8192) break;
    }
    return data;
}

void handle_client(int client_fd, const fs::path &root_dir) {
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

    fs::path target = path == "/" ? fs::path("index.html") : fs::path(path.substr(1));
    target = (root_dir / target).lexically_normal();

    if (!fs::exists(target)) {
        if (!has_extension(path)) {
            target = root_dir / "index.html";
        }
    }

    if (!fs::exists(target) || !fs::is_regular_file(target)) {
        send_response(client_fd, 404, "Not Found", "text/plain", "Resource not found.\n");
        return;
    }

    const auto body = load_file(target);
    if (!body) {
        send_response(client_fd, 500, "Internal Server Error", "text/plain",
                      "Failed to read file.\n");
        return;
    }

    send_response(client_fd, 200, "OK", mime_type(target), *body);
}

int main(int argc, char *argv[]) {
    int port = 1234;
    if (const char *env_port = std::getenv("PORT")) {
        try {
            port = std::stoi(env_port);
        } catch (...) {
        }
    }
    if (argc > 1) {
        try {
            port = std::stoi(argv[1]);
        } catch (...) {
            std::cerr << "Invalid port argument, using default " << port << "\n";
        }
    }

    fs::path root = fs::exists("dist") ? fs::path("dist") : fs::path(".");
    root = fs::absolute(root);

    int server_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (server_fd < 0) {
        std::cerr << "Failed to create socket\n";
        return 1;
    }

    int opt = 1;
    setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

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

    while (true) {
        sockaddr_in client_addr{};
        socklen_t client_len = sizeof(client_addr);
        int client_fd = accept(server_fd, reinterpret_cast<sockaddr *>(&client_addr), &client_len);
        if (client_fd < 0) {
            continue;
        }
        handle_client(client_fd, root);
        close(client_fd);
    }

    close(server_fd);
    return 0;
}
