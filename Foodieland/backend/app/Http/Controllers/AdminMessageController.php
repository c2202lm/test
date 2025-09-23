<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Contact;
use App\Models\Feedback;

class AdminMessageController extends Controller
{
    public function index()
    {
        try {
            $contacts = Contact::latest()->get();   // tin nhắn từ form liên hệ
            $feedbacks = Feedback::latest()->get(); // phản hồi từ người dùng

            return response()->json([
                'contacts' => $contacts,
                'feedbacks' => $feedbacks,
            ]);
        } catch (\Exception $e) {
            \Log::error("Error loading messages: " . $e->getMessage());
            return response()->json([
                'error' => 'Không thể tải dữ liệu messages',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function showContact($id)
    {
        $contact = Contact::findOrFail($id);
        return response()->json($contact);
    }

    public function destroyContact($id)
    {
        $contact = Contact::findOrFail($id);
        $contact->delete();
        return response()->json(['message' => 'Contact deleted success']);
    }

    public function showFeedback($id)
    {
        $feedback = Feedback::findOrFail($id);
        return response()->json($feedback);
    }

    public function destroyFeedback($id)
    {
        $feedback = Feedback::findOrFail($id);
        $feedback->delete();
        return response()->json(['message' => 'Feedback deleted success']);
    }
}
