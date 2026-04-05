"use client";
import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  return await response.json();
}

function StatusSection({ title, isLoading, children }) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <h2 style={{ fontSize: "1.2rem", marginTop: 0, marginBottom: "0.5rem" }}>
        {title}
      </h2>
      <div style={{ padding: 0 }}>
        {isLoading ? <span>loading...</span> : children}
      </div>
    </div>
  );
}

function UpdatedAt() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  const text = data ? new Date(data.updated_at).toLocaleString("pt-BR") : "";

  return (
    <StatusSection title="General" isLoading={isLoading || !data}>
      <p style={{ margin: 0 }}>
        <strong>Last update:</strong> {text}
      </p>
    </StatusSection>
  );
}

function DatabaseData() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  const dbData = data
    ? {
        Environment: data.database.environment,
        Version: data.database.server_version,
        "Max connections": data.database.max_connections,
        "Current connections": data.database.current_connections,
      }
    : {};

  return (
    <StatusSection title="Database Details" isLoading={isLoading || !data}>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {Object.entries(dbData).map(([key, value]) => (
          <li key={key} style={{ marginBottom: "0.25rem" }}>
            <strong>{key}:</strong> {value}
          </li>
        ))}
      </ul>
    </StatusSection>
  );
}

export default function StatusPage() {
  return (
    <div style={{ display: "grid", placeItems: "center", padding: "2.5rem" }}>
      <div
        style={{
          border: "1px solid black",
          borderRadius: "0.5rem",
          padding: "2rem",
          minWidth: "22rem",
        }}
      >
        <h1 style={{ marginTop: 0, marginBottom: "1.5rem" }}>Status</h1>
        <UpdatedAt />
        <DatabaseData />
      </div>
    </div>
  );
}
