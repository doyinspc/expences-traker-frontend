import React from 'react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import SidebarRooms from './Components/SidebarRooms';
import BookingCard from './Components/BookingCard';
import { useParams } from 'react-router';
import ParentDocumentContext from '../../components/common/ParentDocumentContext.jsx';
import useParentDocumentContext from '../../hooks/useParentDocumentContext.js';

export default function Bookings() {
  const { id: client_id } = useParams();
  const parentContext = useParentDocumentContext();
  const clientDetailsRow = parentContext.document || {};

  return (
    <>
      <PageBreadcrumb pageTitle="Client bookings" />
      <ParentDocumentContext context={parentContext} />
      <div>
        <BookingCard client_id={client_id} clientData={clientDetailsRow} />
      </div>
      <div>
        <SidebarRooms />
      </div>
    </>
  );
}
