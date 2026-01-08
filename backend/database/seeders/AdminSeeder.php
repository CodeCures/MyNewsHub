<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create roles
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $userRole = Role::firstOrCreate(['name' => 'user']);

        // Create permissions
        $permissions = [
            'manage-sources',
            'scrape-sources',
            'view-sources',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Assign all permissions to admin role
        $adminRole->givePermissionTo($permissions);

        // Assign limited permissions to user role
        $userRole->givePermissionTo(['view-sources']);

        // Create admin user if not exists
        $admin = User::firstOrCreate(
            ['email' => 'admin@mynewshub.com'],
            [
                'name' => 'Admin User',
                'password' => bcrypt('password'),
            ]
        );

        // Assign admin role
        if (!$admin->hasRole('admin')) {
            $admin->assignRole('admin');
        }

        $this->command->info('Admin user created: admin@mynewshub.com / password');
    }
}
