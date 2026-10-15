// Single source of truth for the website: the same JSON files the PowerPoint generator reads.
// Numbers come from model/AVERRA_Financial_Model.xlsx via scripts/export_data.py; wording from scripts/build_content.py.
import data from "@/data/averra-data.json";
import content from "@/data/content.json";
import signal from "@/data/signal-illustrative.json";

export const D = data;
export const K = content;
export const SIG = signal;

export const inr = (x: number) => (x < 0 ? "-₹" : "₹") + Math.abs(Math.round(x)).toLocaleString("en-IN");
export const lakh = (x: number, d = 1) => `${x < 0 ? "-" : ""}₹${(Math.abs(x) / 1e5).toFixed(d)} L`;
export const crore = (x: number, d = 1) => `${x < 0 ? "-" : ""}₹${(Math.abs(x) / 1e7).toFixed(d)} Cr`;
export const pct = (x: number, d = 0) => `${(x * 100).toFixed(d)}%`;

export type StatusKey = "progress" | "impl" | "bench" | "partial" | "planned" | "depends" | "sim" | "research";
export const STATUS: Record<StatusKey, { label: string; color: string }> = {
  progress: { label: "In progress", color: "#F59E0B" },
  impl: { label: "Implemented", color: "#3B82F6" },
  bench: { label: "Bench-tested", color: "#06B6D4" },
  partial: { label: "In development", color: "#F59E0B" },
  depends: { label: "Needs validation", color: "#F59E0B" },
  planned: { label: "Planned", color: "#94A3B8" },
  sim: { label: "Simulation only", color: "#8B5CF6" },
  research: { label: "Future research", color: "#8B5CF6" },
};
