const renderExpandedRow = (student: Student) => {
    const isActualStudent = student.studentId.startsWith('STU-');

    if (isActualStudent) {
        // Student view - shows personal/academic information
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
                <div>
                    <h4 className="font-semibold text-sm text-slate-700 mb-2">Personal Information</h4>
                    <div className="space-y-1 text-xs text-slate-600">
                        <div><span className="font-medium">Date of Birth:</span> {student.dateOfBirth}</div>
                        <div><span className="font-medium">Nationality:</span> {student.nationality}</div>
                        <div><span className="font-medium">Occupation:</span> {student.occupation}</div>
                        <div><span className="font-medium">Mother Tongue:</span> {student.motherTongue}</div>
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold text-sm text-slate-700 mb-2">Contact & Address</h4>
                    <div className="space-y-1 text-xs text-slate-600">
                        <div><span className="font-medium">Address:</span> {student.address}</div>
                        {student.email && <div><span className="font-medium">Email:</span> {student.email}</div>}
                        {student.phone && <div><span className="font-medium">Phone:</span> {student.phone}</div>}
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold text-sm text-slate-700 mb-2">Additional Information</h4>
                    <div className="space-y-1 text-xs text-slate-600">
                        <div><span className="font-medium">How They Heard:</span> {student.howTheyHeardAboutUs}</div>
                        {student.howTheyHeardAboutUsOther && (
                            <div><span className="font-medium">Details:</span> {student.howTheyHeardAboutUsOther}</div>
                        )}
                    </div>
                </div>

                <div className="md:col-span-2 lg:col-span-3">
                    <h4 className="font-semibold text-sm text-slate-700 mb-2">Record Info</h4>
                    <div className="space-y-1 text-xs text-slate-600">
                        <div><span className="font-medium">Created:</span> {new Date(student.createdAt).toLocaleString()} by {student.createdByUsername}</div>
                        {student.modifiedAt && (
                            <div><span className="font-medium">Modified:</span> {new Date(student.modifiedAt).toLocaleString()} by {student.modifiedByUsername}</div>
                        )}
                    </div>
                </div>
            </div>
        );
    } else {
        // Client view - shows service/business information
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <div>
                    <h4 className="font-semibold text-sm text-slate-700 mb-2">Client Information</h4>
                    <div className="space-y-1 text-xs text-slate-600">
                        <div><span className="font-medium">Client ID:</span> <span className="font-mono text-blue-700">{student.studentId}</span></div>
                        <div><span className="font-medium">Name:</span> {student.name}</div>
                        {student.email && <div><span className="font-medium">Email:</span> {student.email}</div>}
                        {student.phone && <div><span className="font-medium">Phone:</span> {student.phone}</div>}
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold text-sm text-slate-700 mb-2">Service Details</h4>
                    <div className="space-y-1 text-xs text-slate-600">
                        <div><span className="font-medium">Service Type:</span> {student.serviceInterestedIn || 'N/A'}</div>
                        <div><span className="font-medium">Total Fee:</span> {formatCurrency(student.fees, Currency.UGX)}</div>
                        <div><span className="font-medium">Registration Date:</span> {new Date(student.registrationDate).toLocaleDateString()}</div>
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold text-sm text-slate-700 mb-2">Additional Information</h4>
                    <div className="space-y-1 text-xs text-slate-600">
                        <div><span className="font-medium">How They Heard:</span> {student.howTheyHeardAboutUs || 'N/A'}</div>
                        {student.howTheyHeardAboutUsOther && (
                            <div><span className="font-medium">Details:</span> {student.howTheyHeardAboutUsOther}</div>
                        )}
                    </div>
                </div>

                <div className="md:col-span-2 lg:col-span-3">
                    <h4 className="font-semibold text-sm text-slate-700 mb-2">Record Info</h4>
                    <div className="space-y-1 text-xs text-slate-600">
                        <div><span className="font-medium">Created:</span> {new Date(student.createdAt).toLocaleString()} by {student.createdByUsername}</div>
                        {student.modifiedAt && (
                            <div><span className="font-medium">Modified:</span> {new Date(student.modifiedAt).toLocaleString()} by {student.modifiedByUsername}</div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
};
