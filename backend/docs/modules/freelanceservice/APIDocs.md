# Freelance Service Module — API Documentation

This document describes every endpoint exposed by the **Freelance Service module**.

- **Source file:** `modules/freelanceservice/controllers/freelanceService.controller.ts`
- **Controller class:** `FreelanceServiceController`
- **Service class:** `FreelanceServiceService`
- **Base URL:** `http://localhost:<port>/api/v1/`
- **Content-Type:** `application/json`

---

## Table of Contents

| #   | Method   | Endpoint                    | Description                                                 |
| --- | -------- | --------------------------- | ----------------------------------------------------------- |
| 1   | `POST`   | `/services`                 | Create a new service                                        |
| 2   | `GET`    | `/services`                 | List services (paginated)                                   |
| 3   | `PATCH`  | `/services/:id`             | Update an existing service                                  |
| 4   | `DELETE` | `/services/:id`             | Delete a service                                            |
| 5   | `GET`    | `/services/statistics/best` | Top 10 best service statistics                              |
| 6   | `GET`    | `/services/statistics`      | Paginated service statistics (optionally filtered by title) |

---

## The `Service` Object

BigInteger fields (`id`, `parentServiceId`) are serialized as **strings** to avoid
precision loss on the client side. Nested `additionalServices` are included when listing.

```json
{
    "id": "1",
    "title": "Logo Design",
    "content": "I will design a professional logo for your brand",
    "price": 99.99,
    "currency": "USD",
    "parentServiceId": null,
    "additionalServices": []
}
```

| Field                | Type             | Description                                      |
| -------------------- | ---------------- | ------------------------------------------------ |
| `id`                 | `string`         | Auto-generated service id (BigInt as string)     |
| `title`              | `string`         | Service title (max `400` chars)                  |
| `content`            | `string`         | Detailed service description                     |
| `price`              | `number`         | Service price (Decimal)                          |
| `currency`           | `string`         | ISO 4217 currency code, e.g. `USD`, `EUR`, `SAR` |
| `parentServiceId`    | `string \| null` | Parent service id for nested/additional services |
| `additionalServices` | `array`          | Related child services (only in list responses)  |

---

## 1. Add a New Service

### `POST /api/v1/services`

Creates a service in the database.

### Request Body

| Field             | Type               | Required | Constraints                                    |
| ----------------- | ------------------ | -------- | ---------------------------------------------- |
| `title`           | `string`           | ✅       | `maxLength: 400`                               |
| `content`         | `string`           | ✅       | —                                              |
| `price`           | `number`           | ✅       | —                                              |
| `currency`        | `string`           | ✅       | Must be a valid ISO 4217 currency (e.g. `USD`) |
| `parentServiceId` | `string \| number` | ❌       | Digits only, converted to BigInt               |

### Example Request

```bash
curl -X POST "http://localhost:3000/api/v1/services" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Logo Design",
    "content": "I will design a professional logo",
    "price": 99.99,
    "currency": "USD"
  }'
```

### Example Response — `200 OK`

```json
{
    "data": {
        "id": "1",
        "title": "Logo Design",
        "content": "I will design a professional logo",
        "price": 99.99,
        "currency": "USD",
        "parentServiceId": null
    }
}
```

### Creating a child (additional) service

```bash
curl -X POST "http://localhost:3000/api/v1/services" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Logo Two Revisions",
    "content": "A premium package with 2 revision rounds",
    "price": 49.0,
    "currency": "USD",
    "parentServiceId": "1"
  }'
```

---

### Error Responses

| Status | Code           | When                                                                                      |
| ------ | -------------- | ----------------------------------------------------------------------------------------- |
| `400`  | `MISSING_DATA` | The request body is empty                                                                 |
| `400`  | `BAD_INPUT`    | Body fails validation (e.g. missing `title`) — `message` is an array of validation issues |

**Empty body** — `message` is a plain string:

```json
{
    "message": "Please provide the data to create the service",
    "code": "MISSING_DATA"
}
```

**Validation error (Zod)** — `message` is an **array of issues**; each issue has the shape
`{ code, message, path }`:

```json
{
    "code": "BAD_INPUT",
    "message": [
        {
            "code": "invalid_type",
            "message": "The title is required as a string",
            "path": ["title"]
        }
    ]
}
```

---

## 2. Get All Services

### `GET /api/v1/services`

Returns a paginated list of services ordered by `createdAt` (descending).
Each item includes its `additionalServices` children. The response also includes
the **total** number of services in the database for client-side pagination.

### Query Parameters

| Parameter | Type     | Required | Default | Constraints                                         |
| --------- | -------- | -------- | ------- | --------------------------------------------------- |
| `limit`   | `number` | ❌       | `10`    | Integer, max `100`                                  |
| `q`       | `string` | ❌       |         | string, max `400`                                   |
| `from`    | `number` | ❌       | `1`     | Offset, `>= 1` effectively (first page starts at 1) |

> Note: `from` is used as a _page number_ internally — `skip = (from - 1) * limit`.
> Send `from=1` for the first page.
> Note: `q` stands for query it search for services with title similar to q

### Example Request

```bash
curl "http://localhost:3000/api/v1/services?limit=10&from=1"
```

### Example Response — `200 OK`

```json
{
    "data": [
        {
            "id": "1",
            "title": "Logo Design",
            "content": "I will design a professional logo",
            "price": 99.99,
            "currency": "USD",
            "parentServiceId": null,
            "additionalServices": [
                {
                    "id": "2",
                    "title": "Logo Two Revisions",
                    "content": "A premium package with 2 revision rounds",
                    "price": 49.0,
                    "currency": "USD",
                    "parentServiceId": "1"
                }
            ]
        }
    ],
    "total": 1
}
```

| Field   | Type     | Description                              |
| ------- | -------- | ---------------------------------------- |
| `data`  | `array`  | The requested page of services           |
| `total` | `number` | Total number of services in the database |

### Error Responses

| Status | Code        | When                                                                                                    |
| ------ | ----------- | ------------------------------------------------------------------------------------------------------- |
| `400`  | `BAD_INPUT` | `limit` or `from` is not a valid integer, or `limit > 100` — `message` is an array of validation issues |

**Validation error (Zod)** — `message` is an **array of issues**, each with the shape
`{ code, message, path }`:

```json
{
    "code": "BAD_INPUT",
    "message": [
        {
            "code": "invalid_type",
            "message": "Expected number, received string",
            "path": ["limit"]
        }
    ]
}
```

---

## 3. Update a Service

### `PATCH /api/v1/services/:id`

Updates one or more fields of an existing **root** service
(a service that is not itself an additional service).

> ⚠️ Only services with `parentServiceId = null` can be updated. If the id
> points to an additional/child service, a `404` is returned.

### Path Parameters

| Parameter | Type     | Description         |
| --------- | -------- | ------------------- |
| `id`      | `string` | Service id (digits) |

### Request Body — at least one field

| Field      | Type     | Required | Constraints             |
| ---------- | -------- | -------- | ----------------------- |
| `title`    | `string` | ❌       | `maxLength: 400`        |
| `content`  | `string` | ❌       | —                       |
| `price`    | `number` | ❌       | —                       |
| `currency` | `string` | ❌       | Valid ISO 4217 currency |

### Example Request

```bash
curl -X PATCH "http://localhost:3000/api/v1/services/1" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 129.99,
    "currency": "EUR"
  }'
```

### Example Response — `200 OK`

```json
{
    "data": {
        "id": "1",
        "title": "Logo Design",
        "content": "I will design a professional logo",
        "price": 129.99,
        "currency": "EUR",
        "parentServiceId": null
    }
}
```

### Error Responses

| Status | Code            | When                                                               |
| ------ | --------------- | ------------------------------------------------------------------ |
| `400`  | `INVALID_ID`    | `id` param is missing or malformed                                 |
| `400`  | `INVALID_INPUT` | The request body is empty                                          |
| `400`  | `BAD_INPUT`     | Body fails validation — `message` is an array of validation issues |
| `404`  | `NOT_FOUND`     | No root service with this id (or already deleted)                  |

```json
{
    "message": "The service isn't found or it's already deleted",
    "code": "NOT_FOUND"
}
```

**Validation error (Zod)** — `message` is an **array of issues**, each with the shape
`{ code, message, path }`:

```json
{
    "code": "BAD_INPUT",
    "message": [
        {
            "code": "invalid_type",
            "message": "The price is required as a number",
            "path": ["price"]
        }
    ]
}
```

---

## 4. Delete a Service

### `DELETE /api/v1/services/:id`

Deletes a service by id.

### Path Parameters

| Parameter | Type     | Description         |
| --------- | -------- | ------------------- |
| `id`      | `string` | Service id (digits) |

### Example Request

```bash
curl -X DELETE "http://localhost:3000/api/v1/services/1"
```

### Example Response — `200 OK`

```json
{
    "message": "Service deleted successfully"
}
```

### Error Responses

| Status | Code                | When                                        |
| ------ | ------------------- | ------------------------------------------- |
| `400`  | `INVALID_ID`        | `id` param is missing or malformed          |
| `404`  | `SERVICE_NOT_FOUND` | No service with this id, or already deleted |

```json
{
    "message": "There is no service with the provided id or it's already deleted",
    "code": "SERVICE_NOT_FOUND"
}
```

---

## 5. Get Best Service Statistics

### `GET /api/v1/services/statistics/best`

Returns the **top 10** service statistics. Services are grouped by their
lowercased `title` **and** `currency`, then each group is aggregated into:

- `highestPriceInService` — `MAX(price)` across the group
- `lowestPriceInService` — `MIN(price)` across the group
- `avgPriceInService` — `AVG(price)` across the group
- `totalServicesCount` — number of services in the group

Groups are ordered by `totalServicesCount`, then `highestPriceInService`, then
`avgPriceInService` (descending) and only the first `10` are returned.

> All numeric values (`Decimal` / `BigInt`) are serialized as **strings** to avoid
> precision loss on the client side.

### Request — no parameters

```bash
curl "http://localhost:3000/api/v1/services/statistics/best"
```

### Example Response — `200 OK`

```json
{
    "data": [
        {
            "title": "Company Webiste",
            "currency": "USD",
            "highestPriceInService": "149.99",
            "lowestPriceInService": "19.99",
            "avgPriceInService": "84.99",
            "totalServicesCount": "3"
        },
        {
            "title": "Restaurant Menu",
            "currency": "USD",
            "highestPriceInService": "99.99",
            "lowestPriceInService": "49.99",
            "avgPriceInService": "74.99",
            "totalServicesCount": "2"
        }
    ]
}
```

| Field  | Type    | Description                           |
| ------ | ------- | ------------------------------------- |
| `data` | `array` | Up to 10 aggregated statistics groups |

### Error Responses

| Status | Code                    | When                        |
| ------ | ----------------------- | --------------------------- |
| `500`  | `INTERNAL_SERVER_ERROR` | The aggregation query fails |

---

## 6. Get Service Statistics

### `GET /api/v1/services/statistics`

### `GET /api/v1/services/statistics/:title`

Returns paginated service statistics. Services are grouped by their lowercased
`title` **and** `currency`, then each group is aggregated into:

- `highestPriceInService` — `MAX(price)` across the group
- `lowestPriceInService` — `MIN(price)` across the group
- `avgPriceInService` — `AVG(price)` across the group
- `totalServicesCount` — number of services in the group

Groups are ordered by `totalServicesCount`, then `highestPriceInService`, then
`avgPriceInService` (descending) and paginated.

> All numeric values (`Decimal` / `BigInt`) are serialized as **strings** to avoid
> precision loss on the client side.

### Path Parameters

| Parameter | Type     | Required | Constraints                                                                  |
| --------- | -------- | -------- | ---------------------------------------------------------------------------- |
| `title`   | `string` | ❌       | Optional; filters the statistics to a single service title, `maxLength: 400` |

### Query Parameters

| Parameter | Type     | Required | Default | Constraints                                         |
| --------- | -------- | -------- | ------- | --------------------------------------------------- |
| `limit`   | `number` | ❌       | `10`    | Integer, max `100`                                  |
| `from`    | `number` | ❌       | `1`     | Offset, `>= 1` effectively (first page starts at 1) |

> Note: `from` is used as a _page number_ internally — `skip = (from - 1) * limit`.
> Send `from=1` for the first page.

### Example Request

```bash
curl "http://localhost:3000/api/v1/services/statistics?limit=10&from=0"
```

```bash
curl "http://localhost:3000/api/v1/services/statistics/Logo%20Design"
```

### Example Response — `200 OK`

```json
{
    "data": [
        {
            "title": "Company Website",
            "currency": "USD",
            "highestPriceInService": "149.99",
            "lowestPriceInService": "19.99",
            "avgPriceInService": "84.99",
            "totalServicesCount": "3"
        }
    ],
    "total": 1
}
```

| Field   | Type     | Description                                           |
| ------- | -------- | ----------------------------------------------------- |
| `data`  | `array`  | The requested page of statistics groups               |
| `total` | `number` | Total number of statistics groups matching the filter |

### Error Responses

| Status | Code                    | When                                                                                                                                    |
| ------ | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `400`  | `BAD_INPUT`             | `limit` or `from` is not a valid integer, `limit > 100`, or `title` exceeds 400 characters — `message` is an array of validation issues |
| `500`  | `INTERNAL_SERVER_ERROR` | The aggregation query fails                                                                                                             |

---

## Common Error Format

The API returns errors consistently in the following shape:

```json
{
  "message": "Human readable message" | [ { ... validation issues ... } ],
  "code": "MACHINE_READABLE_CODE",
  "...extra": "any additional fields, if defined"
}
```

### The `message` field

`message` is either a **string** or an **array of validation issues**:

- **String** — used for application errors raised through `APIError`
  (e.g. `MISSING_DATA`, `INVALID_ID`, `INVALID_INPUT`, `NOT_FOUND`,
  `SERVICE_NOT_FOUND`).
- **Array** — used when request data fails **Zod** validation. When that happens
  the response `code` is `BAD_INPUT` and each element of the array describes one
  validation issue in the following shape:

```json
[
    {
        "code": "invalid_type",
        "message": "The price is required as a number",
        "path": ["price"]
    }
]
```

| Field     | Type                   | Description                                                                                     |
| --------- | ---------------------- | ----------------------------------------------------------------------------------------------- |
| `code`    | `string`               | The Zod issue code, e.g. `invalid_type`, `too_big`, `invalid_string`                            |
| `message` | `string`               | Human readable description of the failed check                                                  |
| `path`    | `(string \| number)[]` | The field path that failed validation, e.g. `["price"]` or `["additionalServices", 0, "title"]` |

### Global Status Codes

| Status | Code                    | Description                                                                   |
| ------ | ----------------------- | ----------------------------------------------------------------------------- |
| `400`  | `BAD_INPUT`             | Request payload/query failed Zod validation — `message` is an array of issues |
| `500`  | `INTERNAL_SERVER_ERROR` | Unexpected error (production mode)                                            |

In **development** mode, unexpected errors return the raw error object with `500`
instead of the masked `INTERNAL_SERVER_ERROR` payload.
