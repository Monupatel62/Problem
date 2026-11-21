"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";

// ─── Types ─────────────────────────────────────────────────────────────────────

type CommentAuthor = {
  id: string;
  name: string;
  username: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
};

type Comment = {
  id: string;
  text: string;
  likes: number;
  parentId: string | null;
  replyCount: number;
  createdAt: string;
  author: CommentAuthor;
};

type Props = {
  contentId: string;
  contentType: "video" | "reel" | "post";
  commentCount?: number;
};

type SortMode = "newest" | "top";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getApiBase(contentType: "video" | "reel" | "post", contentId: string) {
  switch (contentType) {
    case "video":
      return `/api/videos/${contentId}/comments`;
    case "reel":
      return `/api/reels/${contentId}/comments`;
    case "post":
      return `/api/posts/${contentId}/comments`;
  }
}

function formatTimeAgo(input: string) {
  const time = new Date(input).getTime();
  if (Number.isNaN(time)) return input;
  const diff = Date.now() - time;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;
  if (diff < minute) return "Just now";
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < week) return `${Math.floor(diff / day)}d ago`;
  if (diff < month) return `${Math.floor(diff / week)}w ago`;
  if (diff < year) return `${Math.floor(diff / month)}mo ago`;
  return `${Math.floor(diff / year)}y ago`;
}

function formatCompact(value: number) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return String(value);
}

// ─── Comment Input ─────────────────────────────────────────────────────────────

function CommentInput({
  placeholder,
  onSubmit,
  onCancel,
  autoFocus,
  avatarUrl,
  userName,
}: {
  placeholder: string;
  onSubmit: (text: string) => Promise<void>;
  onCancel?: () => void;
  autoFocus?: boolean;
  avatarUrl?: string | null;
  userName?: string;
}) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  async function handleSubmit() {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(text.trim());
      setText("");
      setFocused(false);
    } finally {
      setSubmitting(false);
    }
  }

  const initial = (userName || "U").charAt(0).toUpperCase();

  return (
    <div className="flex items-start gap-3">
      {/* Avatar */}
      <div className="shrink-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="w-9 h-9 rounded-full object-cover"
          />
        ) : (
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            {initial}
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="flex-1">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder={placeholder}
          rows={focused || text ? 3 : 1}
          maxLength={2000}
          className="w-full bg-transparent text-sm ws-text placeholder:ws-text-3 resize-none outline-none pb-2 transition-all"
          style={{ borderBottom: "1px solid var(--ws-border)" }}
        />
        {(focused || text) && (
          <div className="flex items-center justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => {
                setText("");
                setFocused(false);
                onCancel?.();
              }}
              className="rounded-full px-3 py-1.5 text-sm font-medium ws-text hover:opacity-80"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!text.trim() || submitting}
              onClick={() => void handleSubmit()}
              className="rounded-full px-4 py-1.5 text-sm font-medium text-white transition disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #ec4899, #d946a8)" }}
            >
              {submitting ? "Posting..." : "Comment"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Single Comment ────────────────────────────────────────────────────────────

function CommentItem({
  comment,
  contentId,
  contentType,
  depth,
  currentUserId,
  onDelete,
}: {
  comment: Comment;
  contentId: string;
  contentType: "video" | "reel" | "post";
  depth: number;
  currentUserId?: string;
  onDelete: (id: string) => void;
}) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likes);
  const [showReplies, setShowReplies] = useState(false);
  const [replyMode, setReplyMode] = useState(false);
  const [replies, setReplies] = useState<Comment[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replyCursor, setReplyCursor] = useState<string | null>(null);
  const [replyCount, setReplyCount] = useState(comment.replyCount);
  const [expanded, setExpanded] = useState(false);

  const apiBase = getApiBase(contentType, contentId);
  const isLongText = comment.text.length > 500;
  const displayText = isLongText && !expanded ? comment.text.slice(0, 500) : comment.text;

  async function loadReplies(cursor?: string | null) {
    setLoadingReplies(true);
    try {
      const url = new URL(apiBase, window.location.origin);
      url.searchParams.set("parentId", comment.id);
      url.searchParams.set("limit", "10");
      if (cursor) url.searchParams.set("cursor", cursor);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.ok) {
        setReplies((prev) => (cursor ? [...prev, ...data.items] : data.items));
        setReplyCursor(data.nextCursor || null);
      }
    } finally {
      setLoadingReplies(false);
    }
  }

  function handleToggleReplies() {
    if (!showReplies && replies.length === 0) {
      void loadReplies();
    }
    setShowReplies((prev) => !prev);
  }

  async function handlePostReply(text: string) {
    const res = await fetch(apiBase, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text, parentId: comment.id }),
    });
    const data = await res.json();
    if (data.ok && data.comment) {
      setReplies((prev) => [data.comment, ...prev]);
      setReplyCount((c) => c + 1);
      setShowReplies(true);
      setReplyMode(false);
    }
  }

  function handleLike() {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((c) => c + (newLiked ? 1 : -1));
  }

  async function handleDelete() {
    const confirmed = window.confirm("Delete this comment?");
    if (!confirmed) return;
    const res = await fetch(apiBase, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId: comment.id }),
    });
    const data = await res.json();
    if (data.ok) {
      onDelete(comment.id);
    }
  }

  const initial = (comment.author.name || "U").charAt(0).toUpperCase();
  const maxDepthReached = depth >= 2;

  return (
    <div className={depth > 0 ? "ml-12" : ""}>
      <div className="flex items-start gap-3 py-3">
        {/* Author avatar */}
        <div className="shrink-0">
          {comment.author.avatarUrl ? (
            <img
              src={comment.author.avatarUrl}
              alt=""
              className="w-9 h-9 rounded-full object-cover"
            />
          ) : (
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: "linear-gradient(135deg, #c026d3, #7c3aed)" }}
            >
              {initial}
            </div>
          )}
        </div>

        {/* Comment body */}
        <div className="flex-1 min-w-0">
          {/* Name + time */}
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold ws-text">
              {comment.author.name}
            </span>
            {comment.author.isVerified && (
              <svg className="w-3.5 h-3.5 text-[#aaa]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            )}
            <span className="text-xs ws-text-3">{formatTimeAgo(comment.createdAt)}</span>
          </div>

          {/* Text */}
          <p className="mt-1 text-sm ws-text-2 leading-relaxed whitespace-pre-wrap break-words">
            {displayText}
            {isLongText && !expanded && "..."}
          </p>
          {isLongText && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="text-xs font-semibold ws-text mt-1 hover:opacity-80"
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          )}

          {/* Actions row */}
          <div className="flex items-center gap-4 mt-2">
            {/* Like button */}
            <button
              type="button"
              onClick={handleLike}
              className={`flex items-center gap-1 text-xs transition hover:opacity-80 ${liked ? "text-[#ec4899]" : "ws-text-3"}`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {likeCount > 0 && <span>{formatCompact(likeCount)}</span>}
            </button>

            {/* Reply button (not shown at max depth) */}
            {!maxDepthReached && (
              <button
                type="button"
                onClick={() => setReplyMode((v) => !v)}
                className="flex items-center gap-1 text-xs ws-text-3 transition hover:opacity-80"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Reply
              </button>
            )}

            {/* Delete button (own comments) */}
            {currentUserId === comment.author.id && (
              <button
                type="button"
                onClick={() => void handleDelete()}
                className="text-xs ws-text-3 transition hover:text-red-400"
              >
                Delete
              </button>
            )}
          </div>

          {/* View replies button */}
          {replyCount > 0 && (
            <button
              type="button"
              onClick={handleToggleReplies}
              className="flex items-center gap-1 mt-2 text-xs font-semibold text-[#3ea6ff] hover:opacity-80"
            >
              <svg
                className={`w-3.5 h-3.5 transition-transform ${showReplies ? "rotate-180" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {showReplies ? "Hide replies" : `View ${replyCount} ${replyCount === 1 ? "reply" : "replies"}`}
            </button>
          )}

          {/* Reply input */}
          {replyMode && (
            <div className="mt-3">
              <CommentInput
                placeholder="Add a reply..."
                onSubmit={handlePostReply}
                onCancel={() => setReplyMode(false)}
                autoFocus
              />
            </div>
          )}

          {/* Replies list */}
          {showReplies && (
            <div className="mt-2">
              {replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  contentId={contentId}
                  contentType={contentType}
                  depth={depth + 1}
                  currentUserId={currentUserId}
                  onDelete={(id) => {
                    setReplies((prev) => prev.filter((r) => r.id !== id));
                    setReplyCount((c) => Math.max(0, c - 1));
                  }}
                />
              ))}
              {loadingReplies && (
                <div className="py-2 ml-12">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full animate-pulse" style={{ background: "var(--ws-card)" }} />
                    <div className="h-3 w-32 rounded animate-pulse" style={{ background: "var(--ws-card)" }} />
                  </div>
                </div>
              )}
              {replyCursor && !loadingReplies && (
                <button
                  type="button"
                  onClick={() => void loadReplies(replyCursor)}
                  className="text-xs font-semibold text-[#3ea6ff] hover:opacity-80 ml-12 mt-1"
                >
                  Load more replies
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Loading Skeleton ──────────────────────────────────────────────────────────

function CommentSkeleton() {
  return (
    <div className="flex items-start gap-3 py-3 animate-pulse">
      <div className="w-9 h-9 rounded-full shrink-0" style={{ background: "var(--ws-card)" }} />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-28 rounded" style={{ background: "var(--ws-card)" }} />
        <div className="h-3 w-full rounded" style={{ background: "var(--ws-card)" }} />
        <div className="h-3 w-2/3 rounded" style={{ background: "var(--ws-card)" }} />
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function CommentsSection({ contentId, contentType, commentCount }: Props) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [sort, setSort] = useState<SortMode>("newest");
  const [totalCount, setTotalCount] = useState(commentCount ?? 0);

  const apiBase = getApiBase(contentType, contentId);

  const fetchComments = useCallback(
    async (resetCursor?: boolean) => {
      setLoading(true);
      try {
        const url = new URL(apiBase, window.location.origin);
        url.searchParams.set("limit", "20");
        url.searchParams.set("sort", sort);
        if (!resetCursor && cursor) url.searchParams.set("cursor", cursor);

        const res = await fetch(url.toString());
        const data = await res.json();
        if (data.ok) {
          if (resetCursor) {
            setComments(data.items);
          } else {
            setComments((prev) => [...prev, ...data.items]);
          }
          setCursor(data.nextCursor || null);
        }
      } finally {
        setLoading(false);
      }
    },
    [apiBase, sort, cursor]
  );

  // Initial load + reload on sort change
  useEffect(() => {
    setCursor(null);
    setComments([]);
    void fetchComments(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, contentId]);

  async function handlePostComment(text: string) {
    const res = await fetch(apiBase, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text }),
    });
    const data = await res.json();
    if (data.ok && data.comment) {
      setComments((prev) => [data.comment, ...prev]);
      setTotalCount((c) => c + 1);
    }
  }

  function handleDeleteComment(id: string) {
    setComments((prev) => prev.filter((c) => c.id !== id));
    setTotalCount((c) => Math.max(0, c - 1));
  }

  return (
    <div className="mt-6 pb-6">
      {/* Header with count + sort */}
      <div className="flex items-center gap-6 mb-5">
        <h2 className="text-base font-bold ws-text">
          {totalCount > 0 ? `${formatCompact(totalCount)} Comments` : "Comments"}
        </h2>
        <div className="relative">
          <button
            type="button"
            onClick={() => setSort((s) => (s === "newest" ? "top" : "newest"))}
            className="flex items-center gap-1.5 text-sm font-medium ws-text hover:opacity-80"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 6h18M6 12h12M9 18h6" strokeLinecap="round"/>
            </svg>
            Sort by: {sort === "top" ? "Top comments" : "Newest first"}
          </button>
        </div>
      </div>

      {/* Comment input (only show if authenticated) */}
      {session?.user ? (
        <div className="mb-6">
          <CommentInput
            placeholder="Add a comment..."
            onSubmit={handlePostComment}
            avatarUrl={(session.user as { avatarUrl?: string }).avatarUrl || null}
            userName={session.user.name || undefined}
          />
        </div>
      ) : (
        <div
          className="mb-6 rounded-lg px-4 py-3 text-sm ws-text-3"
          style={{ background: "var(--ws-card)", border: "1px solid var(--ws-border)" }}
        >
          <a href="/auth/login" className="text-[#3ea6ff] font-medium hover:underline">
            Sign in
          </a>{" "}
          to leave a comment
        </div>
      )}

      {/* Comments list */}
      {loading && comments.length === 0 ? (
        <div className="space-y-1">
          <CommentSkeleton />
          <CommentSkeleton />
          <CommentSkeleton />
        </div>
      ) : comments.length === 0 ? (
        <div className="py-10 text-center">
          <div className="text-3xl mb-2">\ud83d\udcac</div>
          <p className="text-sm ws-text-3">No comments yet &mdash; be the first!</p>
        </div>
      ) : (
        <>
          <div
            className="divide-y"
            style={{ borderColor: "var(--ws-border)" }}
          >
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                contentId={contentId}
                contentType={contentType}
                depth={0}
                currentUserId={session?.user?.id as string | undefined}
                onDelete={handleDeleteComment}
              />
            ))}
          </div>

          {/* Load more */}
          {cursor && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => void fetchComments()}
                disabled={loading}
                className="rounded-full px-5 py-2 text-sm font-medium ws-text transition hover:opacity-80"
                style={{ background: "var(--ws-card)", border: "1px solid var(--ws-border)" }}
              >
                {loading ? "Loading..." : "Load more comments"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
