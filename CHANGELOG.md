# Changelog

## [1.1.0](https://github.com/opsrev/companycam-cli/compare/v1.0.0...v1.1.0) (2026-05-01)


### Features

* **photos:** default to last 7 days, add --start/--end range filters ([f21ac45](https://github.com/opsrev/companycam-cli/commit/f21ac45a6597129139c8d440c8462fcaea615d6d))
* **photos:** default to last 7 days, add --start/--end range filters ([36eaeb3](https://github.com/opsrev/companycam-cli/commit/36eaeb37caf0df1c7b22e9537866584e69faaac2))

## 1.0.0 (2026-04-26)


### Features

* add Bearer-authenticated API client with 429 retry ([26a6432](https://github.com/opsrev/companycam-cli/commit/26a6432f2a1d08402a195a7134fe0dc981b28179))
* add CLI entry point with --api-key flag and error handling ([7377896](https://github.com/opsrev/companycam-cli/commit/73778962ca823fa137d1be2437c1e3d95568715e))
* add config module for credential resolution ([eac4041](https://github.com/opsrev/companycam-cli/commit/eac4041c3ee6e6a0895579c7017c3c5bd786542c))
* add page/per_page pagination helper ([0b23555](https://github.com/opsrev/companycam-cli/commit/0b2355503af265e5957cfa558896107c46a4fe14))
* add projects list, get, and photos commands ([d5eace7](https://github.com/opsrev/companycam-cli/commit/d5eace7c2df659061f4298ca25a9e7bf0dfb6ca7))


### Bug Fixes

* fall back to exponential backoff on malformed Retry-After ([2960ef8](https://github.com/opsrev/companycam-cli/commit/2960ef8338a795e4b83679ea5c52be19c777b4e7))
