import { usePage } from "@inertiajs/react";

const DEFAULT_SCHOOL_SETTINGS = {
    school_name: "Bulusan National High School",
    short_name: "Bulusan NHS",
    portal_title: "BNHS Portal",
    school_id: "302196",
    region: "DepEd Region V SDO",
    tagline: "DepEd SSU OPAS & BEEF Portal",
    address: "Bulusan, Sorsogon",
    contact_email: "302196@deped.gov.ph",
    contact_phone: "",
    logo_url: null,
};

export function useSchoolSettings() {
    const { props } = usePage();
    const raw = props?.school_settings || {};

    const schoolName = raw.school_name || DEFAULT_SCHOOL_SETTINGS.school_name;
    const shortName = raw.short_name || DEFAULT_SCHOOL_SETTINGS.short_name;
    const portalTitle = raw.portal_title || DEFAULT_SCHOOL_SETTINGS.portal_title;
    const schoolId = raw.school_id || DEFAULT_SCHOOL_SETTINGS.school_id;
    const region = raw.region || DEFAULT_SCHOOL_SETTINGS.region;
    const tagline = raw.tagline || DEFAULT_SCHOOL_SETTINGS.tagline;
    const address = raw.address ?? DEFAULT_SCHOOL_SETTINGS.address;
    const contactEmail = raw.contact_email ?? DEFAULT_SCHOOL_SETTINGS.contact_email;
    const contactPhone = raw.contact_phone ?? DEFAULT_SCHOOL_SETTINGS.contact_phone;
    const logoUrl = raw.logo_url || null;
    const initial = (shortName || schoolName || "B").trim().charAt(0).toUpperCase();

    return {
        school_name: schoolName,
        short_name: shortName,
        portal_title: portalTitle,
        school_id: schoolId,
        region,
        tagline,
        address,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        logo_url: logoUrl,
        initial,
    };
}

export default useSchoolSettings;

