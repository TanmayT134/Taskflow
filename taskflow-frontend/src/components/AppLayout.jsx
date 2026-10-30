import {useState} from "react";
import {Outlet} from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
export default function AppLayout(){const [open,setOpen]=useState(false);return <div className="app-shell"><Sidebar open={open} onClose={()=>setOpen(false)}/><div className="main-area"><Header onMenu={()=>setOpen(true)}/><main className="page-content"><Outlet/></main><footer className="app-footer"><span>© {new Date().getFullYear()} Taskflow</span><span>Designed for focus. Built for progress.</span></footer></div></div>;}
