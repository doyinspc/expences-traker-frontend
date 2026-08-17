import React from 'react';
import { CNavGroup, CNavItem } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
    cilArrowLeft,
    cilBank,
    cilBriefcase,
    cilEducation, // This icon is a good substitute for School2Icon
} from '@coreui/icons';
import admin_setting from "./admin_setting";


const admin_group = [
    {
        icon: <CIcon customClassName="nav-icon" icon={cilBriefcase} />,
        name: "Administration",
        group: "administration",
        items: [],
        component: CNavGroup,
    },
    {
        icon: <CIcon customClassName="nav-icon" icon={cilEducation} />,
        name: "Academics",
        group: "academics",
        items: [],
        component: CNavGroup,
    },
    {
        icon: <CIcon customClassName="nav-icon" icon={cilBank} />,
        name: "Accounts",
        group: "accounts",
        items: [],
        component: CNavGroup
    }

]

let setting = admin_group.map(groupItem => {

    // For group items, build the items array by filtering and mapping over admin_setting
    const items = admin_setting
        .filter(settingItem => settingItem.group === groupItem.group)
        .map(settingItem => ({
            id: settingItem.id,
            component: CNavItem,
            name: settingItem.name,
            to: `/admin/settings/${settingItem.path}`,
        }));
    // Return the original group item with the new items array
    return {
        ...groupItem,
        items,
    };
});

setting.push({
        icon: <CIcon customClassName="nav-icon"  icon={cilArrowLeft} />,
        name: 'Back',
        to: '/admin/',
        component: CNavItem,
    })
console.log(setting)

export const _setting = setting