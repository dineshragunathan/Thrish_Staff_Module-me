'use client';
import Header from "../components/Header";
import Sidebar from "../components/sideBar";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Dashboard() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (err) {
                console.error("Failed to parse user from localStorage:", err);
            }
        }
    }, []);

    return (
        <>
            <Header />
            <div className="h-screen w-screen flex bg-gray-100">
                <Sidebar />
                <div className="flex-1 p-8 overflow-y-auto">
                    <h1 className="text-3xl font-bold text-gray-800 mb-10">Leave Dashboard</h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <DashboardLink href="./leave/apply" title="Apply for Leave" />
                        <DashboardLink href="./leave/viewstatus" title="View Leave Status" />
                        {(user?.faculty_position === "HOD" || user?.faculty_position === "Principal") && (
                            <DashboardLink href="./leave/manage" title="Manage Applications" />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

function DashboardLink({ href, title }) {
    return (
        <Link
            href={href}
            className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-500 transition duration-200 text-center text-lg font-medium text-gray-700"
        >
            {title}
        </Link>
    );
}
