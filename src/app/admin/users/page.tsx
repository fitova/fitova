export default async function AdminUsersPage() {
    // ⚠ DATABASE CONFIGURATION REQUIRED HERE
    // يجب وضع بيانات قاعدة البيانات الجديدة هنا
    const profiles: any[] = [];

    return (
        <div>
            <div className="mb-8">
                <span className="text-xs font-light tracking-[0.3em] uppercase text-[#8A8A8A]">Management</span>
                <h2 className="font-playfair font-normal text-3xl text-[#0A0A0A] mt-1" style={{ letterSpacing: "-0.02em" }}>Users</h2>
                <p className="text-sm font-light text-[#8A8A8A] mt-1">All registered users. To grant admin access, configure it in your database.</p>
            </div>

            <div className="bg-white border border-[#E8E4DF] overflow-x-auto mb-6">
                <table className="w-full text-sm font-light">
                    <thead>
                        <tr className="border-b border-[#E8E4DF] bg-[#FAFAF9]">
                            {["User ID", "Role", "Joined"].map((h) => (
                                <th key={h} className="text-left px-5 py-3 text-xs font-light tracking-[0.15em] uppercase text-[#8A8A8A]">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {!profiles || profiles.length === 0 ? (
                            <tr><td colSpan={3} className="px-5 py-10 text-center text-[#8A8A8A]">No users found.</td></tr>
                        ) : profiles.map((u) => (
                            <tr key={u.user_id} className="border-b border-[#E8E4DF] last:border-0 hover:bg-[#FAFAF9]">
                                <td className="px-5 py-4 font-mono text-xs text-[#4A4A4A] truncate max-w-[280px]">{u.user_id}</td>
                                <td className="px-5 py-4">
                                    <span className={`text-[10px] font-light tracking-widest uppercase px-2 py-0.5 rounded-full ${u.is_admin ? "bg-[#0A0A0A] text-white" : "bg-[#F0EDE8] text-[#8A8A8A]"}`}>
                                        {u.is_admin ? "Admin" : "User"}
                                    </span>
                                </td>
                                <td className="px-5 py-4 text-[#8A8A8A] text-xs">
                                    {u.created_at ? new Date(u.created_at).toLocaleDateString("en-GB") : "—"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="bg-[#FAFAF9] border border-[#E8E4DF] p-5 rounded-sm">
                <p className="text-xs font-light tracking-[0.15em] uppercase text-[#4A4A4A] mb-2">Grant Admin Access</p>
                <p className="text-xs font-light text-[#8A8A8A] mb-3">Run the following SQL in your database to make a user an admin:</p>
                <pre className="text-xs font-mono bg-[#0A0A0A] text-[#F6F5F2] p-4 overflow-x-auto rounded-sm">
                    {`UPDATE public.user_profile
SET is_admin = true
WHERE user_id = 'PASTE-USER-UUID-HERE';`}
                </pre>
            </div>
        </div>
    );
}
