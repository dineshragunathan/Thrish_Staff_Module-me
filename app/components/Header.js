"use client";
import Link from "next/link";
import clsx from "clsx";
import { usePathname, useRouter} from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
export default function Header()
{
    const currPath = usePathname();
    const [dropdownOpen, setdropdownOpen] = useState(false);
    const [user, setUser] = useState({});
    const profileButtonRef = useRef(null);
    const dropdownRef = useRef(null);

    const router = useRouter();

    const handleDropDownClick = () =>
    {
        setdropdownOpen(!dropdownOpen);
    }

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if(userData)
        {
            setUser(JSON.parse(userData));
        }
    }, [])


    useEffect(() => {
        function handleClickOutsideDropdown(event)
        {
            if (dropdownRef.current && dropdownRef.current.contains(event.target)) {
                return;
            }

            if(profileButtonRef.current && !profileButtonRef.current.contains(event.target))
            {
                setdropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutsideDropdown);
        return () => 
            {
                document.removeEventListener('mousedown', handleClickOutsideDropdown);
            }
    }, []);

    const handleLogOut = () =>
    {
        localStorage.removeItem("user");
        setUser(null);
        console.log("User state:", user); // should show null

        router.push("/");
    }
    useEffect(() => {
        console.log("User after logged out: ", user);
    }, [user])
    
    return(
        <div className={clsx("flex flex-row bg-black h-[50px] w-full overflow-x-hidden text-white items-center justify-between pl-5 pr-2 shadow-lg transition-all duration-300")}>
            
            <img src = "/images/cit_whitelogo.webp" className="h-full rounded-md aspect-square" ></img>
            <a href = '/' className = "absolute left-1/2 -translate-x-1/2 sm: text-sm lg:text-xl cursor-pointer">Chennai Institute of Technology</a>
            {currPath === '/' && (<div className="flex items-center space-x-4">
                <a href="#footer" className="cursor-pointer text-inherit text-sm mr-2">Contact Us</a>
                 <Link href="/login">
                    <button className="relative h-8 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-600 focus:ring-offset-1 focus:ring-offset-slate-50 transition-all duration-300 active:scale-90 ">
                        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)] " />
                        <span className={`inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl hover:bg-white hover:text-black `}>
                        {localStorage.getItem("user") === null ? "Login" : "Enter the Hub"}
                        </span>
                    </button>
                </Link>
            </div>)}
            {currPath !== '/' && (
                <>
                    {user != null && (
                        <div className="absolute right-1 flex flex-row justify-end gap-x-3 w-1/3">
                            {user.faculty_position === "Principal" && (<Link href="/globalSearch" className=" gap-3 px-3 py-2 rounded-lg hover:bg-gray-700 transition-all duration-200 cursor-pointer text-lg active:scale-90">
                                <Search className="flex flex-shrink-0 h-5 w-5 right-1 " />
                            </Link>)}
                            <button ref = { profileButtonRef } className=" h-10 w-10 rounded-3xl overflow-hidden">
                                <img src = {`/api/photo/${user.faculty_id}`} className = {`object-cover w-full h-full`}  onClick = { handleDropDownClick}/>
                            </button>

                            <div ref = { dropdownRef } className = {` ${dropdownOpen ? "block" : "hidden"} bg-black text-white absolute right-2 top-[10vh] min-w-[10vw] p-3 rounded-xl shadow-xl flex items-center justify-center flex-col space-y-1 z-10`}>
                                <span className="text-[125%] text-wrap text-center bg-clip-text text-transparent text- bg-gradient-to-r from-purple-500 to-yellow-500"><strong>{user.faculty_name}</strong></span>
                                <Link className = "w-full" href = "/myprofile"><button className= " cursor-pointer flex items-center justify-center w-full hover:bg-white hover:text-black transition duration-300 p-2 rounded-full active:scale-95">View Profile</button></Link>
                                <button className= " cursor-pointer flex items-center justify-center w-full hover:bg-red-500 transition duration-300 p-2 rounded-full active:scale-95" onClick={handleLogOut}>Log Out</button>
                            </div>
                        </div>
                    )}
                   
                </>
            )}

            
        </div>

    )
}