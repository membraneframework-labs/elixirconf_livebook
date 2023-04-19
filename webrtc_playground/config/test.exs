import Config

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :jellywork, JellyWorkWeb.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4002],
  secret_key_base: "7tO40Ftl2Mwbbim47IidUCsYtn5G1u1TTiB0LyKBS89IU6Ua5Q/R1zfwo98FpgAI",
  server: false

# Print only warnings and errors during test
config :logger, level: :warning

# Initialize plugs at runtime for faster test compilation
config :phoenix, :plug_init_mode, :runtime
