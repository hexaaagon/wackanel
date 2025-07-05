import { CheckCircle } from "lucide-react";

export default function Step1() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <CheckCircle className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">Welcome aboard!</h3>
        <p className="mx-auto max-w-md text-gray-600">
          Wackanel helps you track your Wakatime coding activity and mirror it
          to other Wakapi instances. Let&apos;s set up your account to get the
          most out of your dashboard.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4 text-center transition-shadow hover:shadow-lg">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
            <span className="font-bold text-green-600">1</span>
          </div>
          <h4 className="mb-1 font-medium">Connect</h4>
          <p className="text-sm text-gray-500">Link your coding accounts</p>
        </div>

        <div className="rounded-lg border p-4 text-center transition-shadow hover:shadow-lg">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            <span className="font-bold text-blue-600">2</span>
          </div>
          <h4 className="mb-1 font-medium">Configure</h4>
          <p className="text-sm text-gray-500">Set your preferences</p>
        </div>

        <div className="rounded-lg border p-4 text-center transition-shadow hover:shadow-lg">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
            <span className="font-bold text-purple-600">3</span>
          </div>
          <h4 className="mb-1 font-medium">Explore</h4>
          <p className="text-sm text-gray-500">Start using your dashboard</p>
        </div>
      </div>

      <div className="rounded-lg border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 p-6">
        <h4 className="mb-2 font-semibold text-blue-900">🚀 Getting Started</h4>
        <p className="text-sm text-blue-800">
          This setup wizard will guide you through connecting your accounts and
          configuring your preferences. The entire process takes less than 10
          minutes!
        </p>
      </div>
    </div>
  );
}
