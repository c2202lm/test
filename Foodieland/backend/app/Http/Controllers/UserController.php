<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function profile(Request $request)
    {
        $user = Auth::user();
        return response()->json($user);
    }

    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'name'   => 'sometimes|string|max:255',
            'email'  => [
                'sometimes',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->UserID, 'UserID'),
            ],
            'phone'  => 'nullable|string|max:20',
            'gender' => 'nullable|in:male,female,other',
            'dateOfBirth' => 'nullable|date',

            'currentPassword' => 'nullable|string',
            'newPassword'     => 'nullable|string|min:8',
            'confirmPassword' => 'nullable|string|same:newPassword',

            'height' => 'nullable|numeric|min:0|max:300',
            'weight' => 'nullable|numeric|min:0|max:500',
        ]);

        if (!empty($validated['currentPassword']) || !empty($validated['newPassword'])) {
            if (empty($validated['currentPassword']) || !Hash::check($validated['currentPassword'], $user->password)) {
                return response()->json(['error' => 'Current password is incorrect'], 422);
            }

            if (empty($validated['newPassword'])) {
                return response()->json(['error' => 'New password is required'], 422);
            }

            $user->password = Hash::make($validated['newPassword']);
            $user->save();
        }

        $user->update($request->only([
            'name',
            'email',
            'phone',
            'gender',
            'dateOfBirth',
            'height',
            'weight'
        ]));

        return response()->json($user);
    }
}
