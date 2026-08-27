import React from 'react'
import PageBreadcrumb from '../../components/common/PageBreadCrumb'
import SidebarRooms from "./Components/SidebarRooms"
import BookingCard from './Components/BookingCard'
import { useParams } from 'react-router'
import { getTitleRow } from '../../utils/functions/basci'

export default function Bookings() {

  const {id:client_id} = useParams();
  const clientDetailsRow = getTitleRow(1);
  const {name:displayName, company_name, phone, email} = clientDetailsRow  || {}
 
  return (
    <>
    <PageBreadcrumb pageTitle={displayName} />
    <div>
        <BookingCard client_id={client_id} clientData={clientDetailsRow} />                                       
    </div>
    <div>
        <SidebarRooms />
    </div>
    </>
    
  )
}
