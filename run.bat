@echo off
start "server" npm start
start "client" npm start --prefix ./client/
start "mongo" mongod