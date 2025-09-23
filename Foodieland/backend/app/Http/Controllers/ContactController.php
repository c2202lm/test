<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Contact;

class ContactController extends Controller
{
     public function store(Request $request)
    {
        // Validate dữ liệu
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'subject' => 'required|string|max:255',
            'enquiry_type' => 'required|string|max:100',
            'message' => 'required|string',
        ]);

        // Lưu vào DB (nếu có model Contact)
        $contact = new Contact();
        $contact->name = $request->name;
        $contact->email = $request->email;
        $contact->subject = $request->subject;
        $contact->enquiry_type = $request->enquiry_type;
        $contact->message = $request->message;
        $contact->save();

        // Trả về JSON
        return response()->json([
            'success' => true,
            'message' => 'Your message has been sent successfully!'
        ], 200);
    }
    public function index()
    {
        $contacts = Contact::latest()->get();
        return response()->json($contacts);
    }

}
