all: up
	@docker compose logs -f

up:
	@docker compose up -d

stop:
	@docker compose down

build: stop
	@docker compose up --build -d

migrate: up
	@docker compose exec backend bundle exec rspec spec

test: up
	@./tests/run-all-tests.sh

seed: up
	@docker compose exec backend bin/rails db:seed

re: stop all

.PHONY: all up build stop migrate re test seed
