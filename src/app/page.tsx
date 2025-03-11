"use client";

import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import axiosInstance from "@/utils/axios";
import { FiAlertCircle } from "react-icons/fi";

type PollFormData = {
  question: string;
  options: { text: string }[];
  duration: number;
  hideResults: boolean;
};

const Home = () => {
  const {
    control,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<PollFormData>({
    defaultValues: {
      question: "",
      options: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
      duration: 1,
      hideResults: false,
    },
  });

  const router = useRouter();

  const onSubmit: SubmitHandler<PollFormData> = async (data) => {
    try {
      // Validate at least one option is filled
      const validOptions = data.options.filter(
        (option) => option.text.trim() !== ""
      );
      if (validOptions.length === 0) {
        setError("options", {
          type: "manual",
          message: "At least one option is required.",
        });
        return;
      }

      const formattedData = { ...data, options: validOptions };

      const response = await axiosInstance.post("/poll", formattedData);
      router.push(`/poll/${response?.data?.data?._id}`);
    } catch (error) {
      console.error("Error creating poll:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-700 p-6">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl transform transition-all duration-300 hover:shadow-2xl">
        <h1 className="text-4xl font-extrabold text-violet-700 dark:text-white text-center mb-6">
          🗳️ Create a Poll
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Poll Question */}
          <Controller
            name="question"
            control={control}
            rules={{ required: "Poll question is required." }}
            render={({ field }) => (
              <div>
                <input
                  {...field}
                  type="text"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-violet-500 bg-gray-50 dark:bg-gray-700 dark:text-white transition"
                  placeholder="Enter your poll question..."
                />
                {errors.question && (
                  <p className="text-red-500 text-sm flex items-center mt-1">
                    <FiAlertCircle className="mr-1" /> {errors.question.message}
                  </p>
                )}
              </div>
            )}
          />

          {/* Poll Options */}
          <div className="space-y-2">
            {watch("options").map((_, index) => (
              <Controller
                key={index}
                name={`options.${index}.text`}
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 bg-gray-50 dark:bg-gray-700 dark:text-white transition"
                    placeholder={`Option ${index + 1}`}
                  />
                )}
              />
            ))}
          </div>
          {errors.options && (
            <p className="text-red-500 text-sm flex items-center">
              <FiAlertCircle className="mr-1" /> {errors.options.message}
            </p>
          )}

          {/* Poll Duration */}
          <Controller
            name="duration"
            control={control}
            rules={{ required: "Please select a duration." }}
            render={({ field }) => (
              <div>
                <label className="text-gray-700 dark:text-gray-300 font-semibold">
                  Poll Duration
                </label>
                <select
                  {...field}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:text-white transition"
                >
                  <option value={1}>1 Hour</option>
                  <option value={12}>12 Hours</option>
                  <option value={24}>24 Hours</option>
                </select>
                {errors.duration && (
                  <p className="text-red-500 text-sm flex items-center mt-1">
                    <FiAlertCircle className="mr-1" /> {errors.duration.message}
                  </p>
                )}
              </div>
            )}
          />

          {/* Hide Results Checkbox */}
          <div className="flex items-center space-x-2">
            <Controller
              name="hideResults"
              control={control}
              render={({ field: { value, onChange, ...rest } }) => (
                <input
                  {...rest}
                  type="checkbox"
                  checked={value}
                  onChange={(e) => onChange(e.target.checked)}
                  className="w-5 h-5 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                />
              )}
            />
            <label className="text-gray-900 dark:text-white">
              Hide results until poll ends
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full p-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-bold text-lg transition-all duration-200 transform hover:scale-105 cursor-pointer"
          >
            🚀 Create Poll
          </button>
        </form>
      </div>
    </div>
  );
};

export default Home;
