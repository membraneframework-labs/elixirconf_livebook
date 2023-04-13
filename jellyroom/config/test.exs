import Config

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :jellyroom, JellyroomWeb.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4002],
  secret_key_base: "lGJ+y0W1Wc0lFMfRPKScylJxQrQUlabfRZ85CGpvlZ8Y30A3hc+bT82IwTzKN9+E",
  server: false

# Print only warnings and errors during test
config :logger, level: :warning

# Initialize plugs at runtime for faster test compilation
config :phoenix, :plug_init_mode, :runtime
