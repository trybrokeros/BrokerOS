"use client";

import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { EmployeeDashboardData } from "../../_components/types";
import { Modal } from "../../_components/Modal";
import { EmployeeLeadsView } from "../../_components/EmployeeLeadsView";
import { EmployeeWidgets } from "../../_components/EmployeeWidgets";
import { PipelineBar } from "@/components/dashboard/PipelineBar";
import { toast } from "sonner";
import { EmployeeDailyTasks } from "../../_components/EmployeeDailyTasks";
import { EmployeeBacklogs } from "../../_components/EmployeeBacklogs";
import { EmployeeAnalyticsView } from "../../_components/EmployeeAnalyticsView";
import { ArrowLeft, UserCircle2 } from "lucide-react";
import { PIPELINE_STAGES } from "../../_components/constants";

export default function EmployeeDashboardView() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params.employeeId as string;

  const [dashData, setDashData] = useState<EmployeeDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState("dashboard");

  // Edit Task State
  const [showEditTask, setShowEditTask] = useState(false);
  const [editTarget, setEditTarget] = useState("");
  const [editBacklog, setEditBacklog] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      const res = await authClient.$fetch<EmployeeDashboardData>(
        `/api/dashboard/pre-sales-manager/employees/${employeeId}/dashboard`,
        { baseURL: baseUrl }
      );

      if (res.data) setDashData(res.data);
      if (res.error)
        throw new Error(res.error.message || "Failed to load dashboard");
    } catch (e: any) {
      setError(e?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [employeeId]);

  const handleSaveTask = async () => {
    const taskId = dashData?.dailyTasks.coldCall.taskId;
    if (!taskId) {
      toast.error("Employee has no active task assigned.");
      return;
    }
    setIsSaving(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      await authClient.$fetch(
        `/api/dashboard/pre-sales-manager/employees/tasks/${taskId}`,
        {
          method: "PATCH",
          baseURL: baseUrl,
          body: {
            coldCallTarget: editTarget ? Number(editTarget) : undefined,
            userId: dashData?.dailyTasks.coldCall.taskUserId
              ? employeeId
              : undefined,
            backlogOverride: editBacklog ? Number(editBacklog) : undefined,
          },
        }
      );
      setShowEditTask(false);
      load();
      toast.success("Employee task target updated");
    } catch (e: any) {
      toast.error(e?.message || "Failed to update task.");
    } finally {
      setIsSaving(false);
    }
  };

  const hasBacklog =
    (dashData?.dailyTasks.coldCall.backlog ?? 0) > 0 ||
    (dashData?.dailyTasks.followUp.backlog ?? 0) > 0;

  if (loading)
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-xs font-semibold text-[var(--text-muted)] animate-pulse">
          Loading employee performance overview…
        </div>
      </div>
    );

  if (error)
    return (
      <div className="p-6 m-4 bg-rose-50 rounded-3xl border border-rose-200 text-rose-700 text-xs font-semibold">
        <strong>Error:</strong> {error}
        <button
          onClick={() => router.back()}
          className="block mt-3 text-rose-800 underline underline-offset-4 bg-transparent border-none cursor-pointer font-bold p-0"
        >
          Go Back
        </button>
      </div>
    );

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 animate-enter">
      {/* Top Nav / Header */}
      <div className="flex items-start gap-4 flex-wrap">
        <button
          onClick={() => router.push("/dashboard/pre-sales-manager/employees")}
          className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl py-2 px-3.5 font-bold text-xs cursor-pointer transition-all active:scale-[0.96] press-effect flex items-center gap-1.5 shadow-2xs"
        >
          <ArrowLeft size={14} /> <span>Back to Team List</span>
        </button>
        <div className="flex-1 min-w-[200px]">
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center gap-2.5 m-0">
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)]">
              <UserCircle2 size={18} />
            </div>
            <span>Employee Performance Workspace</span>
          </h1>
          <p className="text-[var(--text-muted)] mt-0.5 text-xs font-medium m-0">
            Audit agent pipeline progression, adjust daily call targets & inspect lead records
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200/80 gap-2">
        <button
          className={`py-2.5 px-4 text-xs font-bold bg-transparent border-b-2 cursor-pointer transition-all ${
            activeTab === "dashboard"
              ? "text-[var(--brand-700)] border-[var(--brand-600)]"
              : "text-slate-500 border-transparent hover:text-slate-800"
          }`}
          onClick={() => setActiveTab("dashboard")}
        >
          Overview & Tasks
        </button>
        <button
          className={`py-2.5 px-4 text-xs font-bold bg-transparent border-b-2 cursor-pointer transition-all ${
            activeTab === "leads"
              ? "text-[var(--brand-700)] border-[var(--brand-600)]"
              : "text-slate-500 border-transparent hover:text-slate-800"
          }`}
          onClick={() => setActiveTab("leads")}
        >
          Assigned Leads
        </button>
        <button
          className={`py-2.5 px-4 text-xs font-bold bg-transparent border-b-2 cursor-pointer transition-all ${
            activeTab === "analytics"
              ? "text-[var(--brand-700)] border-[var(--brand-600)]"
              : "text-slate-500 border-transparent hover:text-slate-800"
          }`}
          onClick={() => setActiveTab("analytics")}
        >
          Detailed Analytics
        </button>
      </div>

      {activeTab === "leads" && <EmployeeLeadsView employeeId={employeeId} />}

      {activeTab === "analytics" && (
        <EmployeeAnalyticsView employeeId={employeeId} />
      )}

      {/* Dashboard Content */}
      {activeTab === "dashboard" && dashData && (
        <div className="space-y-6">
          {/* Section 1: Widgets */}
          <EmployeeWidgets widgets={dashData.widgets} />

          {/* Section 2: Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Pipeline */}
            <PipelineBar
              stages={PIPELINE_STAGES}
              data={dashData.pipeline ?? {}}
            />

            {/* Daily Tasks */}
            <EmployeeDailyTasks
              tasks={dashData.dailyTasks}
              hasBacklog={hasBacklog}
              onEditTask={() => {
                setEditTarget(String(dashData.dailyTasks.coldCall.target));
                setEditBacklog(String(dashData.dailyTasks.coldCall.backlog));
                setShowEditTask(true);
              }}
            />

            {/* Backlogs */}
            <EmployeeBacklogs
              backlogs={dashData.backlogs}
              hasBacklog={hasBacklog}
            />
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {showEditTask && (
        <Modal
          title="Edit Employee Daily Task Target"
          onClose={() => setShowEditTask(false)}
        >
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Cold Call Daily Target
              </label>
              <input
                type="number"
                min={1}
                value={editTarget}
                onChange={(e) => setEditTarget(e.target.value)}
                className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 tabular-nums transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Backlog Override (Optional)
              </label>
              <p className="text-[11px] text-[var(--text-muted)] mb-1.5 font-medium m-0">
                Set to 0 to clear this agent's backlog queue.
              </p>
              <input
                type="number"
                min={0}
                value={editBacklog}
                onChange={(e) => setEditBacklog(e.target.value)}
                className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 tabular-nums transition-all"
                placeholder="e.g. 0 to clear"
              />
            </div>
            <button
              onClick={handleSaveTask}
              disabled={isSaving}
              className="w-full py-2 bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-[0.96] press-effect disabled:opacity-50 mt-2 cursor-pointer"
            >
              {isSaving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
