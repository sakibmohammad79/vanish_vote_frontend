/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import axiosInstance from "@/utils/axios";

const Home = () => {
  const { control, handleSubmit } = useForm({
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
      router.push(`/poll/${response.data._id}`);
    } catch (error) {
      console.error("Error creating poll:", error);
    }
  };

  return (
    <div className="flex flex-col justify-center  items-center min-h-screen p-6 bg-gray-100 dark:bg-gray-900">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Create a Poll
      </h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-lg bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
      >
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
        {Array.from({ length: 4 }).map((_, index) => (
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
        <label className="mb-4 flex items-center">
          <Controller
            name="hideResults"
            control={control}
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <input
                type="checkbox"
                onChange={onChange}
                onBlur={onBlur}
                checked={value}
                ref={ref}
                className="mr-2 w-5 h-5"
              />
            )}
          />
          <span className="text-gray-900 dark:text-white">
            Hide results until poll ends
          </span>
        </label>
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
