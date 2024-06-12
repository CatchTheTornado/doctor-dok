import PatientItem from "./patient-item";

export default function PatientList() {
  const patients = [
    { href: "#", avatarSrc: "/placeholder-user.jpg", avatarFallback: "JD", name: "John Doe", lastVisit: "2 days ago" },
    { href: "#", avatarSrc: "/placeholder-user.jpg", avatarFallback: "JA", name: "Jane Appleseed", lastVisit: "1 week ago" },
    { href: "#", avatarSrc: "/placeholder-user.jpg", avatarFallback: "SM", name: "Sarah Miller", lastVisit: "3 days ago" },
    { href: "#", avatarSrc: "/placeholder-user.jpg", avatarFallback: "RJ", name: "Robert Johnson", lastVisit: "1 month ago" },
  ];

  return (
    <div className="h-[calc(100vh-64px)] overflow-auto">
      <div className="p-4 space-y-4">
        {patients.map((patient, index) => (
          <PatientItem key={index} {...patient} />
        ))}
      </div>
    </div>
  );
}