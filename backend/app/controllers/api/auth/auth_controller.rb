class Api::Auth::AuthController < Api::ApplicationController

  def register
    user = User.new(user_params)
    
    if user.save
      render_success({ user: user_json(user) }, 'アカウントが作成されました')
    else
      render_error(user.errors.full_messages.join(', '))
    end
  end

  def login
    user = User.find_by(email: params[:email])
    
    if user&.valid_password?(params[:password])
      sign_in(user)
      render_success({ user: user_json(user) }, 'ログインしました')
    else
      render_error('メールアドレスまたはパスワードが間違っています', :unauthorized)
    end
  end

  def logout
    sign_out(current_user) if user_signed_in?
    
    # Redirect to home page for GET requests (web interface)
    if request.get?
      redirect_to root_path
    else
      # Return JSON for POST requests (API usage)
      render_success({}, 'ログアウトしました')
    end
  end

  private

  def user_params
    params.require(:user).permit(:email, :password, :password_confirmation)
  end

  def user_json(user)
    {
      id: user.id,
      email: user.email,
      created_at: user.created_at
    }
  end
end