using System;
using System.Threading.Tasks;
using ClearVoice.Api.Controllers;
using ClearVoice.Api.DTOs;
using ClearVoice.Application.Interfaces;
using ClearVoice.Domain.Entities;
using ClearVoice.Infrastructure.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace ClearVoice.Api.Tests
{
    public class AuthControllerTests
    {
        private readonly ClearVoiceDbContext _context;
        private readonly Mock<IPasswordHasher> _passwordHasherMock;
        private readonly Mock<IJwtTokenGenerator> _jwtTokenGeneratorMock;

        public AuthControllerTests()
        {
            var options = new DbContextOptionsBuilder<ClearVoiceDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new ClearVoiceDbContext(options);
            _passwordHasherMock = new Mock<IPasswordHasher>();
            _jwtTokenGeneratorMock = new Mock<IJwtTokenGenerator>();
        }

        [Fact]
        public async Task Register_WithValidData_ShouldCreateUserAndTenant()
        {
            // Arrange
            var controller = new AuthController(_context, _passwordHasherMock.Object, _jwtTokenGeneratorMock.Object);
            var request = new RegisterRequest
            {
                Email = "new@test.com",
                Password = "password123",
                LegalName = "Test Company",
                TaxId = "TAX-123"
            };

            _passwordHasherMock.Setup(x => x.HashPassword(It.IsAny<string>())).Returns("hashed_password");

            // Act
            var result = await controller.Register(request);

            // Assert
            Assert.IsType<CreatedResult>(result);
            
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == "new@test.com");
            Assert.NotNull(user);
            Assert.Equal("hashed_password", user.PasswordHash);
            Assert.Equal("TenantAdmin", user.Role);

            var tenant = await _context.Tenants.FirstOrDefaultAsync(t => t.TaxId == "TAX-123");
            Assert.NotNull(tenant);
            Assert.Equal(tenant.Id, user.TenantId);
        }

        [Fact]
        public async Task Login_WithValidCredentials_ShouldReturnToken()
        {
            // Arrange
            var user = new User
            {
                Id = Guid.NewGuid(),
                TenantId = Guid.NewGuid(),
                Email = "test@test.com",
                PasswordHash = "hashed_password"
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            _passwordHasherMock.Setup(x => x.VerifyPassword("password123", "hashed_password")).Returns(true);
            _jwtTokenGeneratorMock.Setup(x => x.GenerateToken(It.IsAny<User>())).Returns("fake_jwt_token");
            _jwtTokenGeneratorMock.Setup(x => x.GenerateRefreshToken()).Returns("fake_refresh_token");

            var controller = new AuthController(_context, _passwordHasherMock.Object, _jwtTokenGeneratorMock.Object);
            
            // Mock HttpContext for cookies
            var httpContextMock = new DefaultHttpContext();
            controller.ControllerContext = new ControllerContext()
            {
                HttpContext = httpContextMock
            };

            var request = new LoginRequest
            {
                Email = "test@test.com",
                Password = "password123"
            };

            // Act
            var result = await controller.Login(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<AuthResponse>(okResult.Value);
            Assert.Equal("fake_jwt_token", response.AccessToken);
        }

        [Fact]
        public async Task Login_WithInvalidPassword_ShouldReturnUnauthorized()
        {
            // Arrange
            var user = new User
            {
                Id = Guid.NewGuid(),
                TenantId = Guid.NewGuid(),
                Email = "test@test.com",
                PasswordHash = "hashed_password"
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            _passwordHasherMock.Setup(x => x.VerifyPassword("wrong_password", "hashed_password")).Returns(false);

            var controller = new AuthController(_context, _passwordHasherMock.Object, _jwtTokenGeneratorMock.Object);

            var request = new LoginRequest
            {
                Email = "test@test.com",
                Password = "wrong_password"
            };

            // Act
            var result = await controller.Login(request);

            // Assert
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.NotNull(unauthorizedResult);
        }
    }
}
