# Makefile for Omni-Grid C++ Server

CXX = g++
CXXFLAGS = -std=c++17 -O2 -Wall -Wextra
TARGET = omnigrid_server
SRC = server/omnigrid_server.cpp

.PHONY: all clean server

all: server

server: $(TARGET)

$(TARGET): $(SRC)
	$(CXX) $(CXXFLAGS) $(SRC) -o $(TARGET)

clean:
	rm -f $(TARGET)
