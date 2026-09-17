// FletBox/services/http.js

/*
 * HTTP requests module - Estilo Python requests
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
 * // Con headers
 * const data = await httpGet('https://api.example.com/protected', {
 *     headers: { 'Authorization': 'Bearer token123' }
 * });
 * // FletBox/services/http.js
 *
 * HTTP requests module - Estilo Python requests
 *
 * @description
 * Módulo para hacer peticiones HTTP con sintaxis simple y consistente.
 * Soporta GET, POST, PUT, PATCH, DELETE con timeout, headers, y parámetros.
 *
 * @example
 * // 1. GET - Obtener datos al iniciar
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
 *             <Text>Total usuarios: {users.length}</Text>
 *         </Container>
 *     );
 * }
 *
 * @example
 * // 2. POST - Crear datos
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
 *             <Button label="Crear Usuario" onPress={createUser} />
 *             {result && <Text>Usuario creado ID: {result.id}</Text>}
 *         </Container>
 *     );
 * }
 *
 * @example
 * // 3. PUT - Actualizar datos completos
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
 *             <Button label="Actualizar Usuario" onPress={updateUser} />
 *             {result && <Text>Usuario actualizado: {result.name}</Text>}
 *         </Container>
 *     );
 * }
 *
 * @example
 * // 4. PATCH - Actualizar datos parciales
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
 *             <Button label="Actualizar Email" onPress={patchUser} />
 *             {result && <Text>Email actualizado: {result.email}</Text>}
 *         </Container>
 *     );
 * }
 *
 * @example
 * // 5. DELETE - Eliminar datos
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
 *             <Button label="Eliminar Usuario" onPress={deleteUser} />
 *             {deleted && <Text>Usuario eliminado</Text>}
 *         </Container>
 *     );
 * }
 *
 * @example
 * // 6. GET con headers y parámetros
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
 *             <Text>Nombre: {profile?.name}</Text>
 *             <Text>Email: {profile?.email}</Text>
 *         </Container>
 *     );
 * }
 *
 * @example
 * // 7. Manejo de errores
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
 *             {data && <Text>Datos cargados</Text>}
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
 *                 <Text>Usuarios cargados: {users.length}</Text>
 *             )}
 *         </Container>
 *     );
 * }
 *
 * @example
 * // 9. POST con loading
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
 *                 body: { message: 'Hola mundo' }
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
 *                 <Button label="Enviar" onPress={submit} />
 *             )}
 *             {result && <Text>Enviado: {result.id}</Text>}
 *         </Container>
 *     );
 * }
 *
 * @example
 * // 10. Timeout personalizado
 * import { httpGet } from 'fletbox';
 *
 * async function slowRequest() {
 *     try {
 *         const data = await httpGet('https://api.lenta.com/datos', {
 *             timeout: 5000  // 5 segundos máximo
 *         });
 *         console.log(data);
 *     } catch (error) {
 *         console.log('Timeout o error:', error.message);
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
