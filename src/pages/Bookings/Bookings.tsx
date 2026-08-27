import React from 'react'
import PageBreadcrumb from '../../components/common/PageBreadCrumb'
import SidebarRooms from "./Components/SidebarRooms"
import ClientManagement from './Components/ClientManagement'

export default function Bookings() {
    const displayName ="Bookings"
  return (
    <>
    <PageBreadcrumb pageTitle={displayName} />
    <div>
        <ClientManagement />                                       
    </div>
    <div>
        <SidebarRooms /> 
    </div>
    </>
    
  )
}
