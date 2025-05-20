"use client";

import { useState, useEffect } from "react";

// Dracula theme colors
const colors = {
  background: "#282a36",
  currentLine: "#44475a",
  selection: "#44475a",
  foreground: "#f8f8f2",
  comment: "#6272a4",
  cyan: "#8be9fd",
  green: "#50fa7b",
  orange: "#ffb86c",
  pink: "#ff79c6",
  purple: "#bd93f9",
  red: "#ff5555",
  yellow: "#f1fa8c",
};

export default function Home() {
  const [keys, setKeys] = useState<string[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async (search = "") => {
    setLoading(true);
    try {
      const url = search
        ? `/api/redis/keys?search=${encodeURIComponent(search)}`
        : "/api/redis/keys";

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setKeys(data.keys);

        // Fetch values for each key
        const keyValues: Record<string, string> = {};
        for (const key of data.keys) {
          const valueResponse = await fetch(
            `/api/redis/value?key=${encodeURIComponent(key)}`
          );
          const valueData = await valueResponse.json();
          if (valueData.success) {
            keyValues[key] = valueData.value;
          }
        }
        setValues(keyValues);
      } else {
        setError(data.error || "Failed to fetch keys");
      }
    } catch (err) {
      setError("Error connecting to Redis");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchKeys(searchTerm);
  };

  const handleDelete = async (key: string) => {
    try {
      const response = await fetch(
        `/api/redis/delete?key=${encodeURIComponent(key)}`,
        {
          method: "DELETE",
        }
      );
      const data = await response.json();

      if (data.success) {
        // Remove the deleted key from state
        setKeys(keys.filter((k) => k !== key));
        const newValues = { ...values };
        delete newValues[key];
        setValues(newValues);
      } else {
        setError(data.error || "Failed to delete key");
      }
    } catch (err) {
      setError("Error deleting key");
      console.error(err);
    }
  };

  const handleAddKeyValue = async () => {
    try {
      const response = await fetch("/api/redis/set", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key: newKey, value: newValue }),
      });
      const data = await response.json();

      if (data.success) {
        // Add the new key-value pair to state
        setKeys([...keys, newKey]);
        setValues({ ...values, [newKey]: newValue });
        // Reset form and close modal
        setNewKey("");
        setNewValue("");
        setIsModalOpen(false);
      } else {
        setError(data.error || "Failed to add key-value pair");
      }
    } catch (err) {
      setError("Error adding key-value pair");
      console.error(err);
    }
  };

  // No need for client-side filtering since we're now filtering on the server
  const displayKeys = keys.slice(0, 10);

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6" style={{ color: colors.purple }}>
        Redis Studio
      </h1>

      {error && (
        <div
          className="px-4 py-3 rounded mb-4"
          style={{
            backgroundColor: `${colors.red}20`,
            borderColor: colors.red,
            border: "1px solid",
            color: colors.foreground,
          }}
        >
          {error}
        </div>
      )}

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Search keys..."
          className="flex-1 px-4 py-2 rounded"
          style={{
            backgroundColor: colors.currentLine,
            borderColor: colors.comment,
            border: "1px solid",
            color: colors.foreground,
          }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button
          onClick={handleSearch}
          className="px-6 py-2 rounded"
          style={{
            backgroundColor: colors.purple,
            color: colors.background,
          }}
        >
          Search
        </button>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-2 rounded"
          style={{
            backgroundColor: colors.green,
            color: colors.background,
          }}
        >
          Add New
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8" style={{ color: colors.comment }}>
          Loading...
        </div>
      ) : (
        <div
          className="rounded overflow-hidden"
          style={{ border: `1px solid ${colors.currentLine}` }}
        >
          <table className="min-w-full">
            <thead style={{ backgroundColor: colors.currentLine }}>
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: colors.comment }}
                >
                  Key
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: colors.comment }}
                >
                  Value
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: colors.comment }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: colors.background }}>
              {displayKeys.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-4 text-center"
                    style={{ color: colors.comment }}
                  >
                    No keys found
                  </td>
                </tr>
              ) : (
                displayKeys.map((key) => (
                  <tr
                    key={key}
                    className="hover-row"
                    style={{
                      borderTop: `1px solid ${colors.currentLine}`,
                    }}
                  >
                    <td
                      className="px-6 py-4 whitespace-nowrap font-mono text-sm"
                      style={{ color: colors.cyan }}
                    >
                      {key}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap font-mono text-sm overflow-hidden text-ellipsis max-w-xs"
                      style={{ color: colors.green }}
                    >
                      {values[key] || "Loading..."}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDelete(key)}
                        className="delete-button"
                        style={{
                          color: colors.red,
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-opacity-30 flex items-center justify-center backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-[#282a36] p-6 rounded-lg w-96"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              className="text-xl font-bold mb-4"
              style={{ color: colors.purple }}
            >
              Add New Key-Value Pair
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  className="block mb-2"
                  style={{ color: colors.foreground }}
                >
                  Key
                </label>
                <input
                  type="text"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  className="w-full px-4 py-2 rounded"
                  style={{
                    backgroundColor: colors.currentLine,
                    borderColor: colors.comment,
                    border: "1px solid",
                    color: colors.foreground,
                  }}
                />
              </div>
              <div>
                <label
                  className="block mb-2"
                  style={{ color: colors.foreground }}
                >
                  Value
                </label>
                <input
                  type="text"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="w-full px-4 py-2 rounded"
                  style={{
                    backgroundColor: colors.currentLine,
                    borderColor: colors.comment,
                    border: "1px solid",
                    color: colors.foreground,
                  }}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded"
                  style={{
                    backgroundColor: colors.currentLine,
                    color: colors.foreground,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddKeyValue}
                  className="px-4 py-2 rounded"
                  style={{
                    backgroundColor: colors.green,
                    color: colors.background,
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
