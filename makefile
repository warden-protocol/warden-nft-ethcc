-include .env

.PHONY: help build test stageTest

help:
	@echo "Usage:"
	@echo "  make build"
	@echo ""
	@echo "  make test"

build :; forge build --sizes

test :; forge test -vvv