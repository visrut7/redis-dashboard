"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [keys, setKeys] = useState<string[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  // No need for client-side filtering since we're now filtering on the server
  const displayKeys = keys.slice(0, 10);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Redis Studio</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Search keys..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Search
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="border rounded overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Key
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayKeys.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No keys found
                  </td>
                </tr>
              ) : (
                displayKeys.map((key) => (
                  <tr key={key}>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">
                      {key}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm overflow-hidden text-ellipsis max-w-xs">
                      {values[key] || "Loading..."}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDelete(key)}
                        className="text-red-600 hover:text-red-900"
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
    </div>
  );
}
