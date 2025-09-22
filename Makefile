CONFIG_FILE   := ./config.yaml
API_SRC       := ./openapi/api.yaml
API_BUNDLED   := ./openapi/api-bundled.yaml
OUTPUT_DIR    := ./openapi/web
GEN_DIR       := ./src/generated/openapi

migrate-up:
	@npx tsx src/index.ts migrate up

migrate-down:
	@npx tsx src/index.ts migrate down

openapi-gen:
	@npx tsx penapi-generator-cli generate \
	-i $(API_BUNDLED) \
	-g typescript-fetch \
	-o $(GEN_DIR) \
	--global-property models,modelDocs=false,apiDocs=false,apis=false,supportingFiles=false

runs-server:
	KV_VIPER_FILE=$(CONFIG_FILE) \
	@node index.js service run