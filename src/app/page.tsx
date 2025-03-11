"use client";

import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import axiosInstance from "@/utils/axios";

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
          rules={{ required: "Poll question is required." }}
          render={({ field }) => (
            <div>
              <input
                {...field}
                type="text"
                className="p-3 border rounded w-full mb-2 bg-gray-50 dark:bg-gray-700 dark:text-white"
                placeholder="Enter poll question..."
              />
              {errors.question && (
                <p className="text-red-500 text-sm">
                  {errors.question.message}
                </p>
              )}
            </div>
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

        {errors.options && (
          <p className="text-red-500 text-sm">{errors.options.message}</p>
        )}

        {/* Poll Duration */}
        <Controller
          name="duration"
          control={control}
          rules={{ required: "Please select a duration." }}
          render={({ field }) => (
            <div>
              <select
                {...field}
                className="p-3 border rounded mb-2 w-full bg-gray-50 dark:bg-gray-700 dark:text-white"
              >
                <option value={1}>1 Hour</option>
                <option value={12}>12 Hours</option>
                <option value={24}>24 Hours</option>
              </select>
              {errors.duration && (
                <p className="text-red-500 text-sm">
                  {errors.duration.message}
                </p>
              )}
            </div>
          )}
        />

        {/* Hide Results Checkbox */}
        <label className="mb-4 flex items-center">
          <Controller
            name="hideResults"
            control={control}
            render={({ field: { value, onChange, ...rest } }) => (
              <input
                {...rest}
                type="checkbox"
                checked={value}
                onChange={(e) => onChange(e.target.checked)}
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
