# When to use `save({ validateBeforeSave: false })` in MongoDB / Mongoose

## Why this option exists

In Mongoose, `save()` normally runs schema validation before writing the document to MongoDB.

```js
await user.save();
```

This is useful when you want to make sure the document still follows your schema rules.

However, sometimes you intentionally update fields that are not meant to be validated, or you are updating internal values like tokens, hashes, or temporary data that should be stored without triggering validation errors.

That is when this option is useful:

```js
await user.save({ validateBeforeSave: false });
```

It skips schema validation before the save.

---

## Common use cases

### 1. Updating auth tokens

This is a very common use case in authentication systems.

```js
user.refreshToken = refreshToken;
await user.save({ validateBeforeSave: false });
```

Why?

- The token is generated internally.
- It may not match normal schema validation rules.
- You usually want to store it without re-validating unrelated fields.

### 2. Storing hashed or temporary tokens

When you create email verification tokens or password reset tokens:

```js
user.emailVerificationToken = hashToken;
user.emailVerificationTokenExpiry = expiry;
await user.save({ validateBeforeSave: false });
```

Why?

- These values are system-generated.
- You often do not want validation to block the operation.
- They are not user input fields in the normal form-validation flow.

### 3. Updating fields that are not user-facing

If you are storing internal metadata, flags, or generated values, validation may be unnecessary.

### 4. Profile picture update

If you do a normal `save()` after changing only the profile picture, Mongoose validates the whole document, not just that one field.

```js
const user = await User.findById(userId);
user.avatar = { url: newImageUrl };
await user.save();
```

This means validation will run for all required fields on the user document, such as `username`, `email`, `fullname`, and `password`.

If any of those fields are missing or invalid, the save may fail.

So for profile picture updates, the better approach is to update only that field:

```js
await User.findByIdAndUpdate(
   userId,
   { avatar: { url: newImageUrl } },
   { new: true, runValidators: true },
);
```

This updates only the avatar field and keeps the rest of the document safe.

---

## Important warning

Do not use `validateBeforeSave: false` for regular user input updates unless you are sure it is safe.

If you skip validation, invalid or incomplete data can be saved to the database.

For example, this is risky:

```js
user.email = "not-an-email";
await user.save({ validateBeforeSave: false });
```

This can bypass rules you intentionally put in your schema.

---

## Best practice

Use this option only for:

- internal generated values
- JWT refresh tokens
- password reset tokens
- email verification tokens
- system-managed metadata

Do not use it for:

- user-submitted profile updates
- normal form data changes
- fields that must follow strict validation

---

## Example

```js
const user = await User.findById(userId);

user.refreshToken = refreshToken;
await user.save({ validateBeforeSave: false });
```

This is a safe pattern when the value is created by the server and does not need schema validation.

---

## Summary

`save({ validateBeforeSave: false })` is useful when you want to persist internal, server-generated values without running full Mongoose validation.

Use it carefully, and only for trusted system-generated data.
