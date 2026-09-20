// FletBox/services/http.js

/*
 * HTTP requests module - Python requests style
 *
 * @example
 * // GET
 * const users = await httpGet('https://api.example.com/users');
 *
 * // POST
 * const newUser = await httpPost('https://api.example.com/users', {
 *     body: { name: 'Juan', email: 'juan@email.com' }
 * });
 *
 * // PUT
 * const updated = await httpPut('https://api.example.com/users/1', {
 *     body: { name: 'Juan Carlos' }
 * });
 *
 * // DELETE
 * await httpDelete('https://api.example.com/users/1');
 *
 * // With headers
 * const data = await httpGet('https://api.example.com/protected', {
 *     headers: { 'Authorization': 'Bearer token123' }
 * });
 * // FletBox/services/http.js
 *
 * HTTP requests module - Python requests style
 *
 * @description
 * Module for making HTTP requests with a simple and consistent syntax.
 * Supports GET, POST, PUT, PATCH, DELETE with timeout, headers, and params.
 *
 * @example
 * // 1. GET - Fetch data on start
 * import { useEffect, useState } from 'react';
 * import { Container, Text, httpGet } from 'fletbox';
 *
 * function UsersScreen() {
 *     const [users, setUsers] = useState([]);
 *
 *     useEffect(() => {
 *         async function loadUsers() {
 *             const data = await httpGet('https://jsonplaceholder.typicode.com/users');
 *             setUsers(data);
 *         }
 *         loadUsers();
 *     }, []);
 *
 *     return (
 *         <Container>
 *             <Text>Total users: {users.length}</Text>
 *         </Container>
 *     );
 * }
 *
 * @example
 * // 2. POST - Create data
 * import { Button, Container, Text, httpPost } from 'fletbox';
 *
 * function CreateUserScreen() {
 *     const [result, setResult] = useState(null);
 *
 *     const createUser = async () => {
 *         const newUser = await httpPost('https://jsonplaceholder.typicode.com/users', {
 *             body: { name: 'Juan', email: 'juan@email.com' }
 *         });
 *         setResult(newUser);
 *     };
 *
 *     return (
 *         <Container>
 *             <Button label="Create User" onPress={createUser} />
 *             {result && <Text>User created ID: {result.id}</Text>}
 *         </Container>
 *     );
 * }
 *
 * @example
 * // 3. PUT - Update full data
 * import { Button, Container, Text, httpPut } from 'fletbox';
 *
 * function UpdateUserScreen() {
 *     const [result, setResult] = useState(null);
 *
 *     const updateUser = async () => {
 *         const updated = await httpPut('https://jsonplaceholder.typicode.com/users/1', {
 *             body: { name: 'Carlos', email: 'carlos@email.com' }
 *         });
 *         setResult(updated);
 *     };
 *
 *     return (
 *         <Container>
 *             <Button label="Update User" onPress={updateUser} />
 *             {result && <Text>User updated: {result.name}</Text>}
 *         </Container>
 *     );
 * }
 *
 * @example
 * // 4. PATCH - Update partial data
 * import { Button, Container, Text, httpPatch } from 'fletbox';
 *
 * function PatchUserScreen() {
 *     const [result, setResult] = useState(null);
 *
 *     const patchUser = async () => {
 *         const patched = await httpPatch('https://jsonplaceholder.typicode.com/users/1', {
 *             body: { email: 'nuevo@email.com' }
 *         });
 *         setResult(patched);
 *     };
 *
 *     return (
 *         <Container>
 *             <Button label="Update Email" onPress={patchUser} />
 *             {result && <Text>Email updated: {result.email}</Text>}
 *         </Container>
 *     );
 * }
 *
 * @example
 * // 5. DELETE - Delete data
 * import { Button, Container, Text, httpDelete } from 'fletbox';
 *
 * function DeleteUserScreen() {
 *     const [deleted, setDeleted] = useState(false);
 *
 *     const deleteUser = async () => {
 *         await httpDelete('https://jsonplaceholder.typicode.com/users/1');
 *         setDeleted(true);
 *     };
 *
 *     return (
 *         <Container>
 *             <Button label="Delete User" onPress={deleteUser} />
 *             {deleted && <Text>User deleted</Text>}
 *         </Container>
 *     );
 * }
 *
 * @example
 * // 6. GET with headers and params
 * import { useEffect, useState } from 'react';
 * import { Container, Text, httpGet } from 'fletbox';
 *
 * function ProfileScreen() {
 *     const [profile, setProfile] = useState(null);
 *
 *     useEffect(() => {
 *         async function loadProfile() {
 *             const data = await httpGet('https://api.example.com/profile', {
 *                 headers: { 'Authorization': 'Bearer token123' },
 *                 params: { userId: 1 }
 *             });
 *             setProfile(data);
 *         }
 *         loadProfile();
 *     }, []);
 *
 *     return (
 *         <Container>
 *             <Text>Name: {profile?.name}</Text>
 *             <Text>Email: {profile?.email}</Text>
 *         </Container>
 *     );
 * }
 *
 * @example
 * // 7. Error handling
 * import { useEffect, useState } from 'react';
 * import { Container, Text, httpGet } from 'fletbox';
 *
 * function ErrorScreen() {
 *     const [data, setData] = useState(null);
 *     const [error, setError] = useState(null);
 *
 *     useEffect(() => {
 *         async function loadData() {
 *             try {
 *                 const result = await httpGet('https://api.example.com/data');
 *                 setData(result);
 *             } catch (err) {
 *                 setError(err.message);
 *             }
 *         }
 *         loadData();
 *     }, []);
 *
 *     return (
 *         <Container>
 *             {error && <Text color="red">Error: {error}</Text>}
 *             {data && <Text>Data loaded</Text>}
 *         </Container>
 *     );
 * }
 *
 * @example
 * // 8. Loading state
 * import { useEffect, useState } from 'react';
 * import { Container, Text, ActivityIndicator, httpGet } from 'fletbox';
 *
 * function LoadingScreen() {
 *     const [users, setUsers] = useState([]);
 *     const [loading, setLoading] = useState(true);
 *
 *     useEffect(() => {
 *         async function loadUsers() {
 *             const data = await httpGet('https://jsonplaceholder.typicode.com/users');
 *             setUsers(data);
 *             setLoading(false);
 *         }
 *         loadUsers();
 *     }, []);
 *
 *     return (
 *         <Container>
 *             {loading ? (
 *                 <ActivityIndicator size="large" />
 *             ) : (
 *                 <Text>Users loaded: {users.length}</Text>
 *             )}
 *         </Container>
 *     );
 * }
 *
 * @example
 * // 9. POST with loading
 * import { useState } from 'react';
 * import { Button, Container, Text, ActivityIndicator, httpPost } from 'fletbox';
 *
 * function SubmitScreen() {
 *     const [loading, setLoading] = useState(false);
 *     const [result, setResult] = useState(null);
 *
 *     const submit = async () => {
 *         setLoading(true);
 *         try {
 *             const data = await httpPost('https://api.example.com/submit', {
 *                 body: { message: 'Hello world' }
 *             });
 *             setResult(data);
 *         } finally {
 *             setLoading(false);
 *         }
 *     };
 *
 *     return (
 *         <Container>
 *             {loading ? (
 *                 <ActivityIndicator size="large" />
 *             ) : (
 *                 <Button label="Submit" onPress={submit} />
 *             )}
 *             {result && <Text>Submitted: {result.id}</Text>}
 *         </Container>
 *     );
 * }
 *
 * @example
 * // 10. Custom timeout
 * import { httpGet } from 'fletbox';
 *
 * async function slowRequest() {
 *     try {
 *         const data = await httpGet('https://api.lenta.com/datos', {
 *             timeout: 5000  // 5 seconds max
 *         });
 *         console.log(data);
 *     } catch (error) {
 *         console.log('Timeout or error:', error.message);
 *     }
 * }
 */

async function httpRequest(method, url, options = {}) {
  const { body, headers = {}, params = {}, timeout = 30000, ...rest } = options;

  const queryString = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== null && value !== undefined),
  ).toString();
  const separator = url.includes("?") ? "&" : "?";
  const finalUrl = queryString ? `${url}${separator}${queryString}` : url;

  const config = {
    method: method.toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    signal: AbortSignal.timeout(timeout),
    ...rest,
  };

  if (body !== undefined) {
    config.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(finalUrl, config);

    let data;
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const error = new Error(
        `HTTP ${response.status}: ${response.statusText}`,
      );
      error.response = response;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.name === "TimeoutError") {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}

export async function httpGet(url, options = {}) {
  return httpRequest("GET", url, options);
}

export async function httpPost(url, options = {}) {
  return httpRequest("POST", url, options);
}

export async function httpPut(url, options = {}) {
  return httpRequest("PUT", url, options);
}

export async function httpPatch(url, options = {}) {
  return httpRequest("PATCH", url, options);
}

export async function httpDelete(url, options = {}) {
  return httpRequest("DELETE", url, options);
}

export { httpRequest };
