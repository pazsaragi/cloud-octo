export class HTTPService {
  async get(url: string, init?: RequestInit) {
    return fetch(url, {
      ...init,
      method: "GET",
    })
      .then((r) => r.json())
      .then((r) => r)
      .catch((e) => console.error(e));
  }

  async post(url: string, init?: RequestInit) {
    return fetch(url, {
      ...init,
      method: "POST",
    })
      .then((r) => r.json())
      .then((r) => r);
  }

  async patch(url: string, init?: RequestInit) {
    return fetch(url, {
      ...init,
      method: "PATCH",
    })
      .then((r) => r.json())
      .then((r) => r);
  }

  async put(url: string, init?: RequestInit) {
    return fetch(url, {
      ...init,
      method: "PUT",
    })
      .then((r) => r.json())
      .then((r) => r);
  }

  async delete(url: string, init?: RequestInit) {
    return fetch(url, {
      ...init,
      method: "DELETE",
    })
      .then((r) => r.json())
      .then((r) => r);
  }
}
