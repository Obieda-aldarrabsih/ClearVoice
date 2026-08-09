using System;
using System.Security.Cryptography;
using System.Text;
using ClearVoice.Application.Interfaces;
using Konscious.Security.Cryptography;

namespace ClearVoice.Infrastructure.Services
{
    public class Argon2PasswordHasher : IPasswordHasher
    {
        // OWASP recommended settings for Argon2id
        private const int DegreeOfParallelism = 1; // single thread
        private const int Iterations = 3; // 3 iterations
        private const int MemorySize = 65536; // 64 MB
        private const int SaltSize = 16;
        private const int HashSize = 32;

        public string HashPassword(string password)
        {
            var salt = new byte[SaltSize];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(salt);
            }

            var hash = CreateHash(password, salt);
            
            // Format: $argon2id$v=19$m=65536,t=3,p=1$salt(base64)$hash(base64)
            var saltBase64 = Convert.ToBase64String(salt);
            var hashBase64 = Convert.ToBase64String(hash);

            return $"$argon2id$v=19$m={MemorySize},t={Iterations},p={DegreeOfParallelism}${saltBase64}${hashBase64}";
        }

        public bool VerifyPassword(string password, string hashString)
        {
            var parts = hashString.Split('$');
            if (parts.Length != 6 || parts[1] != "argon2id")
                return false;

            var salt = Convert.FromBase64String(parts[4]);
            var hashToVerify = Convert.FromBase64String(parts[5]);

            var newHash = CreateHash(password, salt);
            return CryptographicOperations.FixedTimeEquals(newHash, hashToVerify);
        }

        private byte[] CreateHash(string password, byte[] salt)
        {
            var argon2 = new Argon2id(Encoding.UTF8.GetBytes(password))
            {
                DegreeOfParallelism = DegreeOfParallelism,
                Iterations = Iterations,
                MemorySize = MemorySize,
                Salt = salt
            };

            return argon2.GetBytes(HashSize);
        }
    }
}
