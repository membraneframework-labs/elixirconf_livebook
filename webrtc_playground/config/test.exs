import Config

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :webrtc_playground, WebrtcPlaygroundWeb.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4002],
  secret_key_base: "9GG74L/g0HU+TFZeBBJMO2mn33fVNNhBSWK7TUrHrc48VIn+6AalETrNoiAVlHV+",
  server: false

# Print only warnings and errors during test
config :logger, level: :warning

# Initialize plugs at runtime for faster test compilation
config :phoenix, :plug_init_mode, :runtime
