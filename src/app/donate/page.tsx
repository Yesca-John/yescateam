// Donate a Ticket Page
import { DonateTicketForm } from "@/components/donate/DonateTicketForm";

export const metadata = {
  title: "Donate a Ticket - YESCA",
  description: "Help others attend YESCA events by donating tickets",
};

export default function DonatePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Donate a Ticket
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Help others who are unable to pay experience YESCA events. Your donation will provide tickets that can be issued at the front desk to those in need.
          </p>
        </div>

        {/* Impact Card */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-lg p-6 mb-8 text-white">
          <h3 className="text-xl font-bold mb-2">Your Impact</h3>
          <p className="text-purple-100">
            Every ticket you donate helps someone who cannot afford to attend experience the magic of YESCA. These tickets are distributed at our front desk to eligible attendees on a first-come, first-served basis.
          </p>
        </div>

        {/* Donation Form */}
        <DonateTicketForm />

        {/* How It Works */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            How It Works
          </h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold mr-3">
                1
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Fill the Form</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enter your details and select the number of tickets you want to donate
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center text-pink-600 dark:text-pink-400 font-bold mr-3">
                2
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Make Payment</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Complete the payment securely through our payment gateway
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold mr-3">
                3
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Tickets Added to Pool</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your donated tickets are added to our pool and made available at the front desk
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 font-bold mr-3">
                4
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Help Someone Attend</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Eligible attendees can claim these tickets at the front desk on event day
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
