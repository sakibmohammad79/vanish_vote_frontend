"use client";
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import axiosInstance from "@/utils/axios";
import toast from "react-hot-toast";

const PollPage = () => {
  const { id } = useParams();
  const [poll, setPoll] = useState<any>(null);
  const [error, setError] = useState("");
  const [hasVoted, setHasVoted] = useState(false);
  const [comments, setComments] = useState<any[]>([]);

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (id) {
      fetchPollData();
      fetchComments();

      // Check if the user already voted
      const votedPolls = JSON.parse(localStorage.getItem("votedPolls") || "[]");
      if (votedPolls.includes(id)) {
        setHasVoted(true);
      }
    }
  }, [id]);

  const fetchPollData = async () => {
    try {
      const res = await axiosInstance.get(`/poll/${id}`);
      setPoll(res.data);
    } catch (err) {
      console.error("Error fetching poll:", err);
      setError("Poll not found");
    }
  };

  const fetchComments = async () => {
    try {
      const res = await axiosInstance.get(`/comment/${id}`);
      setComments(res.data.data);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  const handleVote = async (optionIndex: number) => {
    if (hasVoted) {
      toast.error("You have already voted!");
      return;
    }

    try {
      await axiosInstance.post(`/poll/${id}/vote`, { optionIndex });

      // Save vote to local storage
      const votedPolls = JSON.parse(localStorage.getItem("votedPolls") || "[]");
      votedPolls.push(id);
      localStorage.setItem("votedPolls", JSON.stringify(votedPolls));
      setHasVoted(true);

      fetchPollData();
      toast.success("Vote submitted successfully!");
    } catch (err) {
      console.error("Error voting:", err);
      toast.error("Failed to submit vote.");
    }
  };

  const handleReaction = async (reactionType: "like" | "trending") => {
    try {
      await axiosInstance.post(`/poll/reaction/${id}`, { reactionType });
      fetchPollData();
      toast.success(reactionType === "like" ? "Liked!" : "Marked as Trending!");
    } catch (err) {
      console.error(`Error adding ${reactionType}:`, err);
      toast.error(`Failed to add ${reactionType}.`);
    }
  };

  const handleAddComment = async (data: any) => {
    if (!data.text.trim()) {
      toast.error("Comment cannot be empty!");
      return;
    }

    try {
      await axiosInstance.post(`/comment`, { pollId: id, text: data.text });

      fetchComments();
      reset();
      toast.success("Comment added!");
    } catch (err) {
      console.error("Error adding comment:", err);
      toast.error("Failed to add comment.");
    }
  };

  const isPollExpired = () => {
    if (!poll) return false;
    return new Date().getTime() >= new Date(poll.data.expiresAt).getTime();
  };

  const shouldShowResults = () => {
    if (!poll) return false;
    return !poll.data.hideResults || isPollExpired();
  };

  if (error)
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  if (!poll)
    return <div className="text-gray-500 text-center mt-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white text-center mb-4">
          {poll.data.question}
        </h1>

        {/* Poll Options */}
        <ul className="space-y-4">
          {poll.data.options.map((opt: any, index: number) => (
            <li
              key={index}
              className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-700"
            >
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {opt.text}
              </span>
              <div className="flex items-center gap-2">
                {/* Show votes only if results are visible */}
                {shouldShowResults() && (
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    {opt.votes} votes
                  </span>
                )}
                <button
                  onClick={() => handleVote(index)}
                  disabled={hasVoted}
                  className={`px-3 py-1 ${
                    hasVoted
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-violet-600 hover:bg-violet-700"
                  } text-white text-sm rounded-lg transition`}
                >
                  {hasVoted ? "Voted" : "Vote"}
                </button>
              </div>
            </li>
          ))}
        </ul>

        {/* Result Display */}
        {isPollExpired() && (
          <p className="text-center text-green-500 font-bold mt-4">
            Poll has ended. Here are the final results.
          </p>
        )}

        {/* Like and Trending Buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => handleReaction("like")}
            className="flex items-center px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
          >
            👍 Like ({poll.data.reactions?.like || 0})
          </button>
          <button
            onClick={() => handleReaction("trending")}
            className="flex items-center px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
          >
            🔥 Trending ({poll.data.reactions?.trending || 0})
          </button>
        </div>

        {/* Comment Section */}
        <div className="mt-6">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">
            Comments
          </h2>

          {/* Comment Form */}
          <form onSubmit={handleSubmit(handleAddComment)} className="mt-3 flex">
            <input
              {...register("text")}
              type="text"
              className="w-full p-2 border rounded-l-lg dark:bg-gray-700 dark:text-white"
              placeholder="Add a comment..."
            />
            <button
              type="submit"
              className="px-4 bg-green-500 hover:bg-green-600 text-white rounded-r-lg"
            >
              Add
            </button>
          </form>

          {/* Display Comments */}
          <ul className="mt-4 space-y-2">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <li
                  key={comment._id}
                  className="p-3 bg-gray-200 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600"
                >
                  <p className="text-gray-900 dark:text-white font-medium">
                    {comment.text}
                  </p>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </li>
              ))
            ) : (
              <p className="text-gray-500 text-sm">
                No comments yet. Be the first to comment!
              </p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PollPage;
