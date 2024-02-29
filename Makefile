s:
	docker compose up --build

down:
	docker compose down

shell:
	docker exec -it kost-payment-web sh -l

shell-db:
	docker exec -it kost-payment-db bash -l