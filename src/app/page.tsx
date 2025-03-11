/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import axiosInstance from "@/utils/axios";

const Home = () => {
  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      question: "",
      options: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
      duration: 1,
      hideResults: false,
    },
  });

  const router = useRouter();

  const onSubmit = async (data: any) => {
    try {
      const formattedData = {
        ...data,
        options: data.options
          .map((option: any) => ({ text: option.text.trim() }))
          .filter((option: any) => option.text !== ""),
      };

      const response = await axiosInstance.post("/poll", formattedData);
      router.push(`/poll/${response?.data?.data?._id}`);
    } catch (error) {
      console.error("Error creating poll:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <h1 className="text-3xl font-bold text-violet-700 dark:text-white mb-6">
        CREATE A POLL
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-lg bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
      >
        {/* Poll Question */}
        <Controller
          name="question"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              className="p-3 border rounded w-full mb-4 bg-gray-50 dark:bg-gray-700 dark:text-white"
              placeholder="Enter poll question..."
            />
          )}
        />

        {/* Poll Options */}
        {watch("options").map((_, index) => (
          <Controller
            key={index}
            name={`options.${index}.text`}
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className="p-3 border rounded w-full mb-3 bg-gray-50 dark:bg-gray-700 dark:text-white"
                placeholder={`Option ${index + 1}`}
              />
            )}
          />
        ))}

        {/* Poll Duration */}
        <Controller
          name="duration"
          control={control}
          render={({ field }) => (
            <select
              {...field}
              className="p-3 border rounded mb-4 w-full bg-gray-50 dark:bg-gray-700 dark:text-white"
            >
              <option value={1}>1 Hour</option>
              <option value={12}>12 Hours</option>
              <option value={24}>24 Hours</option>
            </select>
          )}
        />

        {/* Hide Results Checkbox */}
        <label className="mb-4 flex items-center">
          <Controller
            name="hideResults"
            control={control}
            render={({ field: { value, onChange, ...rest } }) => (
              <input
                {...rest} // Spread remaining field props
                type="checkbox"
                checked={value} // ✅ Use checked instead of value
                onChange={(e) => onChange(e.target.checked)} // ✅ Ensure boolean value
                className="mr-2 w-5 h-5"
              />
            )}
          />
          <span className="text-gray-900 dark:text-white">
            Hide results until poll ends
          </span>
        </label>

        {/* Submit Button */}
        <button
          type="submit"
          className="p-3 bg-green-500 hover:bg-green-600 text-white rounded w-full font-bold"
        >
          Create Poll
        </button>
      </form>
    </div>
  );
};

export default Home;
