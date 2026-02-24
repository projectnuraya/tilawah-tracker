# Makefile for Tilawah Tracker - Optimization: Build on Host

.PHONY: build-all install build-app build-docker deploy

build-all: install build-app build-docker

install:
	npm install

build-app:
	npx prisma generate
	NODE_OPTIONS="--max-old-space-size=2048" npm run build

build-docker:
	docker compose build --no-cache

deploy:
	docker compose up -d
