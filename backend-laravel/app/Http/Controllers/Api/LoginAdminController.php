<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use App\Models\User;

class LoginAdminController extends Controller
{
    /**
     * @OA\Post(
     *     path="/auth/admin/login",
     *     tags={"Authentication"},
     *     summary="Login admin user",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email","password"},
     *             @OA\Property(property="email", type="string", format="email"),
     *             @OA\Property(property="password", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Login successful",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="token", type="string"),
     *             @OA\Property(property="expires_at", type="string", format="date-time")
     *         )
     *     ),
     *     @OA\Response(response=401, ref="#/components/schemas/Error")
     * )
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 400);
        }

        $admin = DB::table('admin_credentials')
            ->where('admin_email', $request->email)
            ->first();

        // TODO: hash fix
        if (!$admin /*|| !Hash::check($request->password, $admin->admin_password)*/) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid admin credentials'
            ], 401);
        }

        // Generate admin token
        $token = Str::random(60);
        $tokenExpiration = now()->addHours(24);

        // Update admin token
        DB::table('admin_credentials')
            ->where('id', $admin->id)
            ->update([
                'token' => $token,
                'token_expires_at' => $tokenExpiration,
                'token_last_used_at' => now()
            ]);

        // Create or update user record for admin
        $user = User::firstOrNew(['user_email' => $admin->admin_email]);
        
        if (!$user->exists) {
            $user->user_name = 'Admin';
            $user->user_email = $admin->admin_email;
            $user->user_password = $admin->admin_password;
            $user->user_birthday = now(); 
            $user->role = 'ADMIN';
            $user->email_verified_at = now(); 
        }

        $user->token = $token;
        $user->token_expires_at = $tokenExpiration;
        $user->token_last_used_at = now();
        $user->save();

        return response()->json([
            'id_admin' => $admin->id,
            'status' => 'success',
            'token' => $token,
            'expires_at' => $tokenExpiration,
            'role' => 'ADMIN'
        ]);
    }
}