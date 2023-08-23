#!/bin/bash

.PHONY: start-server generate tsc dev docker-up prisma-studio

start-server: generate tsc dev

generate:
	cd server && npm run generate

tsc:
	cd server && npm run tsc

dev:
	cd server && npm run dev

docker-up:
	docker-compose up

prisma-studio: docker-up
	cd server && npx prisma studio

