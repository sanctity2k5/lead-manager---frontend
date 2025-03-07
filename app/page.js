"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { FaSpinner } from "react-icons/fa";
import bgImage from "@/public/bg.jpg";
import formBg from "@/public/form.jpg";

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  status: yup.string().required("Status is required"),
});

export default function Home() {
  const [leads, setLeads] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: "", email: "", status: "Engaged" },
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch(
        "https://lead-manager-backend.onrender.com/leads"
      );
      const data = await response.json();
      setLeads(data);
    } catch (error) {
      console.error("Error fetching leads:", error);
    }
  };

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://lead-manager-backend.onrender.com/leads",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      if (!response.ok) throw new Error("Failed to submit");
      reset();
      setIsFormVisible(false);
      fetchLeads();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "New":
        return "bg-blue-200 text-blue-800";
      case "Engaged":
        return "bg-yellow-200 text-yellow-800";
      case "Proposal Sent":
        return "bg-purple-200 text-purple-800";
      case "Closed-Won":
        return "bg-green-200 text-green-800";
      case "Closed-Lost":
        return "bg-red-200 text-red-800";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Calculate the current leads to display
  const indexOfLastLead = currentPage * itemsPerPage;
  const indexOfFirstLead = indexOfLastLead - itemsPerPage;
  const currentLeads = leads.slice(indexOfFirstLead, indexOfLastLead);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen p-6 bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage.src})` }}
    >
      <div className="absolute inset-0 bg-black opacity-60"></div>
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="text-4xl font-bold text-white mb-8 relative z-10"
      >
        Lead Manager
      </motion.h1>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsFormVisible(true)}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg transition-all relative z-10"
      >
        Add New Lead
      </motion.button>

      <AnimatePresence>
        {isFormVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 flex items-center justify-center z-50"
          >
            <div className="absolute inset-0 bg-black opacity-70"></div>
            <div className="relative bg-white p-8 rounded-lg shadow-xl max-w-lg w-full px-6 mx-6">
              <h2 className="text-xl font-semibold mb-4 text-center">
                Add Lead
              </h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <input
                  {...register("name")}
                  placeholder="Name"
                  className="w-full p-3 border rounded-lg"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name.message}</p>
                )}
                <input
                  {...register("email")}
                  type="email"
                  placeholder="Email"
                  className="w-full p-3 border rounded-lg"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
                <select
                  {...register("status")}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="New">New</option>
                  <option value="Engaged">Engaged</option>
                  <option value="Proposal Sent">Proposal Sent</option>
                  <option value="Closed-Won">Closed-Won</option>
                  <option value="Closed-Lost">Closed-Lost</option>
                </select>
                {errors.status && (
                  <p className="text-red-500 text-sm">
                    {errors.status.message}
                  </p>
                )}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsFormVisible(false)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    Submit{" "}
                    {loading && <FaSpinner className="animate-spin mr-2" />}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl mt-6 relative z-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
          Leads
        </h2>
        {currentLeads.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {currentLeads.map((lead) => (
              <li
                key={lead._id}
                className="p-1 lg:p-4 flex justify-between items-center"
              >
                <div>
                  <p className="text-lg font-semibold">{lead.name}</p>
                  <p className="text-sm text-gray-600">{lead.email}</p>
                  <p className="text-xs text-gray-500 lg:mt-1">
                    Created At: {new Date(lead.createdAt).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 text-sm rounded-full ${getStatusClasses(
                    lead.status
                  )}`}
                >
                  {lead.status}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500">No leads available.</p>
        )}

        {/* Pagination Controls */}
        <div className="flex justify-center mt-4">
          {Array.from(
            { length: Math.ceil(leads.length / itemsPerPage) },
            (_, i) => (
              <button
                key={i + 1}
                onClick={() => paginate(i + 1)}
                className={`mx-1 px-4 py-2 rounded-lg ${
                  currentPage === i + 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {i + 1}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
