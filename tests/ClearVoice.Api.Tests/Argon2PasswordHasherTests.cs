using System;
using ClearVoice.Infrastructure.Services;
using Xunit;

namespace ClearVoice.Api.Tests
{
    public class Argon2PasswordHasherTests
    {
        private readonly Argon2PasswordHasher _hasher;

        public Argon2PasswordHasherTests()
        {
            _hasher = new Argon2PasswordHasher();
        }

        [Fact]
        public void HashPassword_ShouldReturnValidArgon2Format()
        {
            // Arrange
            var password = "SecurePassword123!";

            // Act
            var hash = _hasher.HashPassword(password);

            // Assert
            Assert.NotNull(hash);
            Assert.StartsWith("$argon2id$v=19$m=65536,t=3,p=1$", hash);
            var parts = hash.Split('$');
            Assert.Equal(6, parts.Length); // "", "argon2id", "v=19", "m=...", salt, hash
        }

        [Fact]
        public void VerifyPassword_WithCorrectPassword_ShouldReturnTrue()
        {
            // Arrange
            var password = "SecurePassword123!";
            var hash = _hasher.HashPassword(password);

            // Act
            var isValid = _hasher.VerifyPassword(password, hash);

            // Assert
            Assert.True(isValid);
        }

        [Fact]
        public void VerifyPassword_WithIncorrectPassword_ShouldReturnFalse()
        {
            // Arrange
            var password = "SecurePassword123!";
            var hash = _hasher.HashPassword(password);

            // Act
            var isValid = _hasher.VerifyPassword("WrongPassword!", hash);

            // Assert
            Assert.False(isValid);
        }

        [Fact]
        public void VerifyPassword_WithInvalidHashFormat_ShouldReturnFalse()
        {
            // Arrange
            var password = "SecurePassword123!";
            var invalidHash = "NotAValidHashFormat";

            // Act
            var isValid = _hasher.VerifyPassword(password, invalidHash);

            // Assert
            Assert.False(isValid);
        }
    }
}
