"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Plus, Check, Trash2 } from "lucide-react";
import { useAuthStore } from "@/lib/stores/authStore";
import { projectsApi, type ProjectDTO } from "@/lib/api/projects";
import BrandLogo from "@/components/shared/BrandLogo";
import AddBrandModal from "./AddBrandModal";

const LIME = "#C9F31D";

export default function ProjectSwitcher() {
  const token        = useAuthStore((s) => s.token);
  const project      = useAuthStore((s) => s.project);
  const projectId    = useAuthStore((s) => s.projectId);
  const setProject   = useAuthStore((s) => s.setProject);
  const clearProject = useAuthStore((s) => s.clearProject);

  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [open, setOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    projectsApi
      .list()
      .then((list) => { if (!cancelled) setProjects(list); })
      .catch(() => { /* ignore — chip falls back to stored project */ });
    return () => { cancelled = true; };
  }, [token, projectId]);

  const projectName = project?.name ?? "Select a brand";

  const switchTo = (p: ProjectDTO) => {
    setProject({ id: p._id, name: p.name, domain: p.domain, brandName: p.brandName });
    setOpen(false);
  };

  const handleCreated = (p: ProjectDTO) => {
    setProjects((prev) => [...prev, p]);
    setProject({ id: p._id, name: p.name, domain: p.domain, brandName: p.brandName });
    setShowModal(false);
    setOpen(false);
  };

  const handleDelete = async (e: React.MouseEvent, p: ProjectDTO) => {
    e.stopPropagation();
    if (!confirm(`Delete "${p.name}"? This removes the brand and its tracking data from your dashboard.`)) return;
    try {
      await projectsApi.remove(p._id);
      const remaining = projects.filter((x) => x._id !== p._id);
      setProjects(remaining);
      if (projectId === p._id) {
        if (remaining.length) switchTo(remaining[0]);
        else { clearProject(); setOpen(false); }
      }
    } catch {
      alert("Could not delete the brand. Please try again.");
    }
  };

  return (
    <div
      style={{
        padding: "10px 12px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        flexShrink: 0,
        position: "relative",
      }}
    >
      {/* Current project chip */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 10px",
          borderRadius: 8,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid transparent",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
      >
        <BrandLogo domain={project?.domain} name={projectName} size={24} radius={6} />
        <span
          style={{
            fontSize: 13, fontWeight: 500, color: "#fff", flex: 1, textAlign: "left",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}
        >
          {projectName}
        </span>
        <ChevronDown size={13} style={{ color: "rgba(255,255,255,0.40)", flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* backdrop */}
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 60 }} />

          <div
            className="animate-fade-in"
            style={{
              position: "absolute",
              top: "calc(100% - 4px)",
              left: 12,
              right: 12,
              background: "#18191B",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: 10,
              padding: 6,
              boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
              zIndex: 70,
            }}
          >
            <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.30)", letterSpacing: "0.06em", textTransform: "uppercase", padding: "6px 8px 8px" }}>
              Your brands
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 2, maxHeight: 240, overflowY: "auto" }}>
              {projects.length === 0 ? (
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.40)", padding: "6px 8px 10px" }}>
                  No brands yet — add one below.
                </p>
              ) : (
                projects.map((p) => {
                  const active = p._id === projectId;
                  return (
                    <div
                      key={p._id}
                      className="group"
                      style={{
                        display: "flex", alignItems: "center", borderRadius: 7,
                        background: active ? "rgba(201,243,29,0.08)" : "transparent",
                      }}
                      onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
                      onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      <button
                        onClick={() => switchTo(p)}
                        style={{
                          flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 9,
                          padding: "8px 8px", border: "none", cursor: "pointer", background: "transparent", textAlign: "left",
                        }}
                      >
                        <BrandLogo domain={p.domain} name={p.name} size={22} radius={6} fallbackBg={active ? LIME : "rgba(255,255,255,0.10)"} fallbackColor={active ? "#000" : "#fff"} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 12.5, fontWeight: 500, color: "#fff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
                          <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.35)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.domain}</p>
                        </div>
                        {active && <Check size={14} style={{ color: LIME, flexShrink: 0 }} />}
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, p)}
                        title={`Delete ${p.name}`}
                        style={{ flexShrink: 0, padding: "6px 9px", border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center" }}
                        onMouseEnter={(e) => { (e.currentTarget.firstChild as HTMLElement).style.color = "#EF4444"; }}
                        onMouseLeave={(e) => { (e.currentTarget.firstChild as HTMLElement).style.color = "rgba(255,255,255,0.3)"; }}
                      >
                        <Trash2 size={13} style={{ color: "rgba(255,255,255,0.3)", transition: "color .15s" }} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "6px 0" }} />

            <button
              onClick={() => { setShowModal(true); setOpen(false); }}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 9,
                padding: "8px 8px", borderRadius: 7, border: "none", cursor: "pointer",
                background: "transparent", color: LIME, fontSize: 12.5, fontWeight: 600,
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(201,243,29,0.08)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <div style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, background: "rgba(201,243,29,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Plus size={14} />
              </div>
              Add new brand
            </button>
          </div>
        </>
      )}

      {showModal && (
        <AddBrandModal onClose={() => setShowModal(false)} onCreated={handleCreated} />
      )}
    </div>
  );
}
