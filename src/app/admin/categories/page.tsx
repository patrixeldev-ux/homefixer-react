"use client";

import { useState } from "react";

interface Category {
  id: number;
  name: string;
  status: "Active" | "Inactive";
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([
    { id: 1, name: "Plumber", status: "Active" },
    { id: 2, name: "Electrician", status: "Active" },
    { id: 3, name: "AC Repair", status: "Inactive" },
  ]);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryStatus, setNewCategoryStatus] = useState<"Active" | "Inactive">("Active");

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory: Category = {
        id: categories.length + 1,
        name: newCategoryName.trim(),
        status: newCategoryStatus,
      };
      setCategories([...categories, newCategory]);
      setNewCategoryName("");
      setNewCategoryStatus("Active");
    }
  };

  const toggleStatus = (id: number) => {
    setCategories(
      categories.map((cat) =>
        cat.id === id
          ? { ...cat, status: cat.status === "Active" ? "Inactive" : "Active" }
          : cat
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow">
        <h1 className="text-lg font-semibold">Categories</h1>
      </div>

      {/* Add New Category */}
      <section className="bg-white p-4 rounded-xl shadow">
        <h2 className="font-semibold mb-3">Add New Category</h2>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Category Name</label>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="e.g., Cleaning"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={newCategoryStatus}
              onChange={(e) => setNewCategoryStatus(e.target.value as "Active" | "Inactive")}
              className="p-2 border rounded"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <button
            onClick={handleAddCategory}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Category
          </button>
        </div>
      </section>

      {/* Existing Categories */}
      <section className="bg-white p-4 rounded-xl shadow">
        <h2 className="font-semibold mb-3">Existing Categories</h2>
        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex justify-between items-center p-3 border rounded"
            >
              <div>
                <p className="font-medium">{category.name}</p>
                <p className={`text-sm ${category.status === "Active" ? "text-green-600" : "text-red-600"}`}>
                  {category.status}
                </p>
              </div>
              <button
                onClick={() => toggleStatus(category.id)}
                className={`px-3 py-1 rounded text-sm ${
                  category.status === "Active"
                    ? "bg-red-100 text-red-600 hover:bg-red-200"
                    : "bg-green-100 text-green-600 hover:bg-green-200"
                }`}
              >
                {category.status === "Active" ? "Deactivate" : "Activate"}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
